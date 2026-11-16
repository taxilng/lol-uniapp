import { lesoNeedSign, lesoSignHeaders } from "@/utils/lesoSign";

/**
 * lolso1.com（搜联盟）接口封装
 *
 * 走 vite 代理 /leso -> https://r1.lolso1.com（同源下 HttpOnly 会话 cookie 由浏览器自动携带）
 * 登录：POST /user/login { account, password, rememberMe }，成功后服务端 Set-Cookie 会话
 * 注意：同一账号重复登录会顶掉旧会话（浏览器登录会顶掉 App/其他端登录态）
 */

const LESO_BASE = "/leso";

export function lesoUrl(path, query = {}) {
  const qs = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return qs ? `${path}?${qs}` : path;
}

async function lesoRequest(pathWithQuery, { method = "GET", body } = {}) {
  const path = pathWithQuery.split("?")[0];
  const header = { "Content-Type": "application/json" };
  if (lesoNeedSign(path)) {
    Object.assign(header, lesoSignHeaders(method, pathWithQuery, body ?? null));
  }
  const res = await uni.request({
    url: `${LESO_BASE}${pathWithQuery}`,
    method,
    data: body,
    header,
  });
  const resData = res?.data ?? {};
  if (resData.errCode === "0000" || resData.errCode === 0) {
    return resData.data;
  }
  const err = new Error(resData.message || "搜联盟接口请求失败");
  err.errCode = resData.errCode;
  err.requestID = resData.requestID;
  throw err;
}

// 登录（无需签名），成功后 cookie 由代理同源自动保存；account 即用户名
export function lesoLogin({ account, password, rememberMe = true }) {
  return lesoRequest("/user/login", {
    method: "POST",
    body: { account, password, rememberMe },
  });
}

// 注册：username 3-16位数字、字母或中文；phone/email 必填；inviteCode 可选
export function lesoRegister(body) {
  return lesoRequest("/user/register", { method: "POST", body });
}

// 退出登录
export function lesoLogout() {
  return lesoRequest("/user/logout", { method: "POST" });
}

// 当前登录用户
export function lesoMe() {
  return lesoRequest("/user/me");
}

// 查询玩家（返回 puuid / server_id / 等级），player 格式：游戏名#tagLine
export function lesoQueryRecords(params = {}) {
  const { page = 1, pageSize = 8, player, group = true } = params;
  return lesoRequest(
    lesoUrl("/league/player/query-records", { page, pageSize, player, group })
  );
}

// 发起一次玩家查询（POST）
export function lesoQueryRecord(body) {
  return lesoRequest("/league/player/query-record", { method: "POST", body });
}

// 解析召唤师：游戏名 + tagLine → { puuid, serverId }
export function lesoResolveSummoner({ gameName, tagLine }) {
  return lesoRequest("/league/player/server_info", {
    method: "POST",
    body: { gameName, tagLine },
  });
}

// 玩家总览（base: puuid/profileIconId/privacy/level/lastGameDate/gameName/tagLine）
export function lesoOverview({ serverId, puuid }) {
  return lesoRequest("/league/player/overview", {
    method: "POST",
    body: { serverId, puuid },
  });
}

// 对局分析（matchHistory: Riot Match-V5 格式，每页最多 20 场）
// tag: 队列过滤（-1 全部），page 从 1 开始
export function lesoMatchAnalysis({ serverId, puuid, page = 1, size = 20, tag = -1 }) {
  return lesoRequest("/league/player/match_analysis", {
    method: "POST",
    body: { serverId, puuid, page, size, tag },
  });
}

/**
 * 获取玩家完整数据（对齐 akari 链路的 baseInfo + list 结构）
 * 返回 { puuid, serverId, base, matchHistory }
 * base 与 akari leagueSummoner 的 baseInfo 字段同构（含 lastGameDate/privacy/level）
 * matchHistory 与 akari history_all 的对局数组同构（participants/gameDuration/queueId 等）
 */
export async function lesoFetchPlayerFull({ gameName, tagLine, count = 20 }) {
  const { puuid, serverId } = await lesoResolveSummoner({ gameName, tagLine });
  const totalPages = Math.max(1, Math.ceil(count / 20));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const [overview, matchPages] = await Promise.all([
    lesoOverview({ serverId, puuid }),
    Promise.all(
      pages.map(page =>
        lesoMatchAnalysis({ serverId, puuid, page, size: 20, tag: -1 }).catch(
          () => ({ matchHistory: [] })
        )
      )
    ),
  ]);
  // 按页拼接并按开始时间去重、倒序（最新在前）
  const seen = new Set();
  const matchHistory = [];
  matchPages
    .map(m => m?.matchHistory ?? [])
    .flat()
    .forEach(m => {
      if (m?.gameId && !seen.has(m.gameId)) {
        seen.add(m.gameId);
        // 搜联盟 participants 用 championID（大写），下游统一用 championId
        (m.participants ?? []).forEach(p => {
          if (p.championId === undefined && p.championID !== undefined) {
            p.championId = p.championID;
          }
        });
        matchHistory.push(m);
      }
    });
  matchHistory.sort((a, b) => b.gameStartTimestamp - a.gameStartTimestamp);
  return { puuid, serverId, base: overview?.base ?? {}, matchHistory };
}

// 战绩卡数据
export function lesoCardData(body) {
  return lesoRequest("/league/player/card_data", { method: "POST", body });
}

// 大区维护状态
export function lesoLeagueMaintenance() {
  return lesoRequest("/system/league-maintenance");
}
