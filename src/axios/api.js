import { getBaseUrl } from "@/utils/auth";
export const searchPlayerAll = data =>
  uni.request({ url: `${getBaseUrl()}/lzyumi/lol/info`, data });

// 查询战绩列表
// openId: HKrfJ4eSdQZsr9zzTJKVww==
// gameId: 600106534682
// areaId: 4
// lzyumiSign: 6341b4f8c72ca58938779f1338f7b5b1
// signStr: 6121444383666
export const searchPlayerHistory = data =>
  uni.request({
    url: `${getBaseUrl()}/lzyumi/lol/info/findOrderDetailInfoAll`,
    data,
  });

// "banInfoList": [],  // 被禁用的英雄列表（此处为空）
// "totalBaseKilled": 0,  // 摧毁的基地数量
// "totalKills": 53,  // 队伍总击杀数
// "isSurrender": 0,  // 是否投降（0 表示未投降）
// "totalTurretsKilled": 0,  // 摧毁的防御塔数量
// "totalDampenKilled": 0,  // 摧毁的抑制器数量
// "totalAssists": 103,  // 队伍总助攻数
// "totalDeaths": 70,  // 队伍总死亡数
// "totalDragonKills": 0,  // 击杀的龙数量
// "teamId": "100",  // 队伍 ID（此处为 100）
// "totalGoldEarned": 65614,  // 队伍总获得的金币数
// "totalBaronKills": 0,  // 击杀的大龙数量
// "win": "Fail",  // 比赛结果（Fail 表示失败）
// "teamElo": "1146"  // 队伍的 Elo 评分

/**
 * 隐藏分接口
 * https://lol.lzyumi.top/lzyumi/lol/info/getRankEloInfo
 * 入参
 * openId
 * areaId
 * lzyumiSign
 * signStr
 */
export const getRankEloInfo = data =>
  uni.request({ url: `${getBaseUrl()}/lzyumi/lol/info/getRankEloInfo`, data });

// 注册
export const joinUN_USE = data =>
  uni.request({
    url: `https://white3zz.m3zz.com/app/user/register`,
    method: "post",
    data,
  });

// 登录
export const userLogin = data =>
  uni.request({
    url: `https://white3zz.m3zz.com/app/user/login`,
    method: "post",
    data,
  });
// 获取用户信息
export const profile = data =>
  uni.request({
    url: `https://white3zz.m3zz.com/app/user/profile`,
    method: "post",
    data,
    header: { "m3-authorization": uni.getStorageSync("m3-authorization") },
  });
// 验证码
export const generate_captcha = () =>
  uni.request({
    url: `https://air.m3zz.com/v1/common/generate_captcha?width=100&height=32`,
  });
// 查询用户基本信息
export const leagueSummoner = data =>
  uni.request({
    url: `https://white3zz.m3zz.com/lol/query-summoner-profile-by-game-name`,
    method: "post",
    data,
    header: { "m3-authorization": uni.getStorageSync("m3-authorization") },
  });
export const querySummonerProfile = data =>
  uni.request({
    url: `https://white3zz.m3zz.com/lol/query-summoner-profile`,
    method: "post",
    data,
    header: { "m3-authorization": uni.getStorageSync("m3-authorization") },
  });
// 查询战绩
export const history_all = data =>
  uni.request({
    url: `https://white3zz.m3zz.com/lol/query-match-history-simple`,
    method: "post",
    data,
    header: { "m3-authorization": uni.getStorageSync("m3-authorization") },
  });
// 验证码2
export const getBspapp = data =>
  uni.request({
    url: `https://2955b122-0e37-42a7-a4ee-4ddd503fe6b6.bspapp.com/http/user-center/`,
    method: "post",
    data,
  });
// 查询实时的比赛
export const spectator_info = data =>
  uni.request({
    url: `https://white3zz.m3zz.com/lol/query-spectator`,
    method: "post",
    data,
    header: { "m3-authorization": uni.getStorageSync("m3-authorization") },
  });

// 查询云顶战绩详情
export const getYunDingDetailOneInfo = data =>
  uni.request({
    url: `${getBaseUrl()}/lzyumi/lol/info/getYunDingDetailOneInfo`,
    data,
  });
