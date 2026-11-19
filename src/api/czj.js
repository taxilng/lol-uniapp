/**
 * chazhanji.cn（峡谷查个分）接口封装
 *
 * 走 vite 代理 /czj -> https://chazhanji.cn（同源会话 cookie 由浏览器自动携带）
 * 登录：POST /User/login_password.php { account, password }，成功后服务端 Set-Cookie 会话
 * 注意：战绩/资产等查询接口要求当前会话先按 puuid 请求一次 /api/get_puuid.php 授权，
 * 否则返回 403「请刷新网页，即可恢复E3」
 */

const CZJ_BASE = "/czj";

// 峡谷查个分账号池（密码统一）
const CZJ_PASSWORD = "123456";
export const CZJ_ACCOUNT_POOL = ["fx1", "fx01", "fx2"];

const CZJ_ACCOUNT_INDEX_KEY = "czjAccountIndex";

export function getCzjCurrentAccount() {
  const idx = Number(uni.getStorageSync(CZJ_ACCOUNT_INDEX_KEY));
  return CZJ_ACCOUNT_POOL[idx] || CZJ_ACCOUNT_POOL[0];
}

// 切换当前使用账号：清空进行中的登录，下次请求会用新账号重新登录
export function setCzjCurrentAccount(name) {
  const idx = CZJ_ACCOUNT_POOL.indexOf(name);
  if (idx < 0) return false;
  uni.setStorageSync(CZJ_ACCOUNT_INDEX_KEY, idx);
  loginPromise = null;
  return true;
}

function czjUrl(path, query = {}) {
  const qs = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return qs ? `${path}?${qs}` : path;
}

async function czjRawRequest(pathWithQuery, { method = "GET", body } = {}) {
  const res = await uni.request({
    url: `${CZJ_BASE}${pathWithQuery}`,
    method,
    data: body,
    header: { "Content-Type": "application/json" },
  });
  return res?.data ?? {};
}

// 需要重新登录的响应：401 未登录、403 会话非法
const CZJ_AUTH_EXPIRED_CODES = [401, 403];
const CZJ_AUTH_EXPIRED_KEYWORDS = ["请先完成登录", "非法调用", "未登录"];

function isCzjAuthExpired(resData) {
  if (!CZJ_AUTH_EXPIRED_CODES.includes(resData?.code)) return false;
  const message = String(resData?.message || "");
  return CZJ_AUTH_EXPIRED_KEYWORDS.some(keyword => message.includes(keyword));
}

// 今日免费查询次数用完
function isCzjQuotaExhausted(resData) {
  if (resData?.code !== 403) return false;
  const permission = resData?.data?.permission;
  return (
    permission?.type === "free_limited" ||
    Number(permission?.remaining) === 0 ||
    String(resData?.message || "").includes("次数已用完")
  );
}

// 本次运行期间已用尽的账号，避免在账号之间来回切换
const exhaustedAccounts = new Set();
let switchingPromise = null;

// 切换到下一个未用尽的账号并登录；没有可用账号时返回 false
function switchCzjAccount() {
  if (!switchingPromise) {
    exhaustedAccounts.add(getCzjCurrentAccount());
    const next = CZJ_ACCOUNT_POOL.find(
      name => !exhaustedAccounts.has(name)
    );
    if (!next) {
      return Promise.resolve(false);
    }
    console.log("峡谷查个分查询次数用尽，切换账号：", next);
    setCzjCurrentAccount(next);
    switchingPromise = ensureCzjLogin()
      .then(() => true)
      .finally(() => {
        switchingPromise = null;
      });
  }
  return switchingPromise;
}

let loginPromise = null;

// 自动登录（并发请求共享同一次登录，避免重复登录顶掉会话）
function ensureCzjLogin() {
  if (!loginPromise) {
    loginPromise = czjRawRequest("/User/login_password.php", {
      method: "POST",
      body: {
        account: getCzjCurrentAccount(),
        password: CZJ_PASSWORD,
      },
    })
      .then(resData => {
        if (resData.code !== 0 && resData.code !== 200) {
          const err = new Error(resData.message || "峡谷查个分登录失败");
          err.code = resData.code;
          throw err;
        }
        return resData.data;
      })
      .finally(() => {
        loginPromise = null;
      });
  }
  return loginPromise;
}

async function czjRequest(pathWithQuery, { method = "GET", body } = {}) {
  const path = pathWithQuery.split("?")[0];
  let resData = await czjRawRequest(pathWithQuery, { method, body });
  if (path !== "/User/login_password.php") {
    if (isCzjAuthExpired(resData)) {
      // 未登录 / 会话失效：自动登录一次并重试（只重试一次，避免死循环）
      await ensureCzjLogin();
      resData = await czjRawRequest(pathWithQuery, { method, body });
    } else if (isCzjQuotaExhausted(resData)) {
      // 今日免费查询次数用完：切换到下一个账号并重试
      const switched = await switchCzjAccount();
      if (switched) {
        resData = await czjRawRequest(pathWithQuery, { method, body });
      }
    }
  }
  if (resData.code === 0 || resData.code === 200) {
    return resData.data;
  }
  const err = new Error(resData.message || "峡谷查个分接口请求失败");
  err.code = resData.code;
  err.data = resData.data;
  throw err;
}

// 解析召唤师：游戏名 + 尾标 → { puuid, region(中文大区名) 等基础信息 }
// 结果按 `gameName#tagLine` 缓存到本地，命中后不再请求接口
const SUMMONER_CACHE_KEY = "czjSummonerCache";

function getSummonerCache() {
  try {
    const obj = JSON.parse(uni.getStorageSync(SUMMONER_CACHE_KEY));
    return obj && typeof obj === "object" ? obj : {};
  } catch (error) {
    return {};
  }
}

function setSummonerCache(key, value) {
  const cache = getSummonerCache();
  cache[key] = value;
  uni.setStorageSync(SUMMONER_CACHE_KEY, JSON.stringify(cache));
}

export async function czjResolveSummoner({ gameName, tagLine }) {
  const key = `${gameName}#${tagLine}`;
  const cached = getSummonerCache()[key];
  if (cached?.puuid && cached?.serverId) {
    return cached;
  }
  const data = await czjRequest("/api/get_puuid.php", {
    method: "POST",
    body: { region: "auto", name: gameName, wb: tagLine },
  });
  // 只缓存稳定的 puuid/大区，昵称、等级、最后游戏时间每次由授权接口刷新
  const value = {
    puuid: data?.puuid,
    serverId: data?.region,
  };
  if (value.puuid && value.serverId) {
    setSummonerCache(key, value);
  }
  return value;
}

// 查询授权：按 puuid 请求一次 get_puuid，未授权时战绩接口会报 E3
function czjArmQuery({ region, puuid }) {
  return czjRequest("/api/get_puuid.php", {
    method: "POST",
    body: { region, puuid },
  });
}

// 战绩分页（Riot Match-V5 格式，每页最多 20 场）
// 返回 [{ ...info, matchId }]
export async function czjMatchPage({
  region,
  puuid,
  page = 1,
  size = 20,
  queueId = 0,
  authorized = false,
}) {
  // 查询授权：未授权时战绩接口会返回 403「请刷新网页，即可恢复E3」
  if (!authorized) {
    await czjArmQuery({ region, puuid });
  }
  const data = await czjRequest("/api/get_match_page.php", {
    method: "POST",
    body: { region, puuid, queueId, page, limit: size },
  });
  return (Array.isArray(data) ? data : [])
    .map(m => ({
      ...(m?.json ?? {}),
      matchId: m?.metadata?.match_id,
    }))
    .filter(m => m.gameId);
}

// 当前登录账号信息（含每日查询额度）
export function czjMe() {
  return czjRequest(`/User/me.php?_t=${Date.now()}`);
}

// 先强制登录一次，再查询当前账号信息（设置页点击刷新用）
export async function czjLoginAndMe() {
  await ensureCzjLogin();
  return czjRequest(`/User/me.php?_t=${Date.now()}`);
}

// 每日签到，code 为公众号获取的签到口令
// 返回完整响应（含 message），用于区分「签到成功」和「今天已签到」
export async function czjCheckin(code) {
  const path = "/User/checkin.php";
  let resData = await czjRawRequest(path, { method: "POST", body: { code } });
  if (isCzjAuthExpired(resData)) {
    await ensureCzjLogin();
    resData = await czjRawRequest(path, { method: "POST", body: { code } });
  }
  if (resData.code === 0 || resData.code === 200) {
    return resData;
  }
  const err = new Error(resData.message || "签到失败");
  err.code = resData.code;
  err.data = resData.data;
  throw err;
}

/**
 * 获取玩家完整数据（对齐搜联盟链路的 baseInfo + list 结构）
 * 返回 { puuid, serverId, base, matchHistory, statistics }
 */
export async function czjFetchPlayerFull({ gameName, tagLine, count = 20 }) {
  const summoner = await czjResolveSummoner({ gameName, tagLine });
  const { puuid, serverId } = summoner;
  const totalPages = Math.max(1, Math.ceil(count / 20));
  // 授权接口同时返回玩家基础信息；查询授权只需一次，后续分页按顺序拉取
  const overview = await czjArmQuery({ region: serverId, puuid });
  const pages = [];
  for (let i = 1; i <= totalPages; i += 1) {
    try {
      pages.push(
        await czjMatchPage({
          region: serverId,
          puuid,
          page: i,
          size: 20,
          authorized: true,
        })
      );
    } catch (error) {
      // 首页错误（未登录/额度用完）需要抛给调用方，后续页失败则按空页处理
      if (i === 1) throw error;
      pages.push([]);
    }
  }
  // 按开始时间去重、倒序（最新在前）
  const seen = new Set();
  const matchHistory = [];
  pages
    .flat()
    .forEach(m => {
      if (m?.gameId && !seen.has(m.gameId)) {
        seen.add(m.gameId);
        matchHistory.push(m);
      }
    });
  matchHistory.sort((a, b) => b.gameStartTimestamp - a.gameStartTimestamp);

  // 该玩家场均输出/承伤占比（取每局 challenges 中的队伍占比再平均）
  const damageShares = [];
  const takenShares = [];
  matchHistory.forEach(m => {
    const yours = (m.participants ?? []).find(p => p.puuid === puuid);
    const damageShare = Number(yours?.challenges?.teamDamagePercentage);
    const takenShare = Number(
      yours?.challenges?.damageTakenOnTeamPercentage
    );
    if (Number.isFinite(damageShare)) damageShares.push(damageShare);
    if (Number.isFinite(takenShare)) takenShares.push(takenShare);
  });
  const averageOf = list =>
    list.length ? list.reduce((acc, v) => acc + v, 0) / list.length : undefined;

  const statistics = matchHistory.length
    ? {
        summary: {
          count: matchHistory.length,
          averageDamageDealtToChampionShareOfTeam: averageOf(damageShares),
          averageDamageTakenShareOfTeam: averageOf(takenShares),
        },
      }
    : undefined;

  return {
    puuid,
    serverId,
    base: {
      profileIconId: overview?.profileIconId,
      level: overview?.level,
      privacy: overview?.privacy,
      lastGameDate: overview?.lastGameDate,
    },
    matchHistory,
    statistics,
  };
}
