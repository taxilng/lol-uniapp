import pick from "lodash/pick";
import { md5 } from "@/utils/md5";
import { baseUrlList, lzyumiA, platform2areaId } from "@/utils/area.js";

function md5Sign(signMonth, signDay, signHours, signMinutes, signSeconds) {
  if (signMonth < 10) signMonth = "0" + signMonth;
  if (signDay < 10) signDay = "0" + signDay;
  if (signHours < 10) signHours = "0" + signHours;
  if (signMinutes < 10) signMinutes = "0" + signMinutes;
  if (signSeconds < 10) signSeconds = "0" + signSeconds;
  var singInfoStr =
    "dd" +
    signMonth +
    "o" +
    signDay +
    "u" +
    signHours +
    "d" +
    signMinutes +
    "o" +
    signSeconds +
    "dd";
  return md5(singInfoStr);
}

/**
 * 7 9 14 50 53 33666
 * 
 * lzyumiSign: ca32288c8c5f669622c71e542c59c313
signStr: 7914505333666


lzyumiSign: ca32288c8c5f669622c71e542c59c313
signStr: 7914505333666

lzyumiSign: 72d6af98ea6646b725f101ba01dd6a0e
signStr: 79 15 1 1 33633

lzyumiSign: f2721c70c51b53a91e7c9def4f9247e2
signStr: 79 15 1 2 33633
 * 
 */
export function getSign() {
  const currentDate = new Date(Date.now() - 5000);
  // const currentDate = new Date('2024-07-9 14:50:53')
  let signMonth = currentDate.getMonth() + 1 + "";
  let signDay = currentDate.getDate() + "";
  let signHours = currentDate.getHours() + "";
  let signMinutes = currentDate.getMinutes() + "";
  let signSeconds = currentDate.getSeconds() + "";
  const lzyumiSign = md5Sign(
    signMonth,
    signDay,
    signHours,
    signMinutes,
    signSeconds
  );
  const signStr =
    signMonth +
    signDay +
    signHours +
    signMinutes +
    signSeconds +
    signMonth.length * 3 +
    "" +
    signDay.length * 3 +
    "" +
    signHours.length * 3 +
    "" +
    signMinutes.length * 3 +
    "" +
    signSeconds.length * 3;

  return { lzyumiSign, signStr };
}

export function addUserList(userInfo) {
  const userList = uni.getStorageSync("userList");
  let list = [];
  try {
    list = userList ? JSON.parse(userList) : [];
    const flag = list.some(
      item => item.label === userInfo.label && item.areaId === userInfo.areaId
    );
    if (!flag) {
      list.push(userInfo);
    }
  } catch (error) {
    list = [userInfo];
  }
  uni.setStorageSync("userList", JSON.stringify(list));
}

export function addSelectedUserList(userInfo) {
  const userList = uni.getStorageSync("selectedUserList");
  let list = [];
  try {
    list = userList ? JSON.parse(userList) : [];
    const flag = list.some(item => item === userInfo);
    if (!flag) {
      list.push(userInfo);
    }
  } catch (error) {
    list = [userInfo];
  }
  uni.setStorageSync("selectedUserList", JSON.stringify(list));
}

export function dataProcessing(data, dataRange) {
  const nameInfoNew = data.battleInfo.nameInfoNew;
  const mapOneInfoList = data.battleInfo.mapOneInfoList;
  const allChaotic = mapOneInfoList.find(v => v.type === "大乱斗");
  const allMatching = mapOneInfoList.find(v => v.type === "经典对局");
  const Ranking = mapOneInfoList.filter(
    v => v.type !== "经典对局" && v.type !== "大乱斗"
  );
  let rankingTotal = 0;
  let rankingWins = 0;
  Ranking.forEach(rank => {
    rankingTotal += rank.total;
    rankingWins += rank.wins;
  });
  const rankingData = {
    wins: rankingWins,
    total: rankingTotal,
    losses: rankingTotal - rankingWins,
    netWin: rankingWins * 2 - rankingTotal,
    rate: ((rankingWins / rankingTotal) * 100).toFixed(2),
  };
  const pattern1 = /^(.*?)#(\d+)$/;
  const name = nameInfoNew.match(pattern1)[1];
  const tagLine = nameInfoNew.match(pattern1)[2];
  return {
    ...data,
    ...data.battleInfo,
    name,
    tagLine,
    allChaotic,
    allMatching,
    rankingData,
    ...handlerData(data.data, dataRange, data.battleInfo),
  };
}

function handlerData(source, dataRange, battleInfo) {
  // 第一局的时间
  const titleTime = source[source.length - 1].titleTime;
  const startTime = titleTime.startsWith("20")
    ? titleTime.slice(0, 10)
    : titleTime.slice(0, 5);
  let effectiveCompetition = source.filter(
    v => v.title && !v.title?.includes("重开局")
  );

  console.log("有效局", effectiveCompetition);
  if (dataRange?.before) {
    effectiveCompetition = effectiveCompetition.filter(v => {
      const year = new Date().getFullYear();
      const reg = /^\d{2}-\d{2}/;
      const fullDate = reg.test(v.titleTime)
        ? `${year}-${v.titleTime.slice(0, 5)}`
        : v.titleTime.slice(0, 10);
      const CompetitionTime = new Date(fullDate).getTime();
      return (
        CompetitionTime >= new Date(dataRange.before).getTime() &&
        CompetitionTime < new Date(dataRange.after).getTime() + 1000 * 3600 * 24
      );
    });
  }
  const totalGames = effectiveCompetition.length;
  let wins = 0;
  let losses = 0;
  let mvp = 0;
  let svp = 0;
  let matchNum = 0;
  let aramNum = 0;
  let rankNum = 0;
  let teamNum = 0;
  let blackoutTimes = 0;
  let twoBlack = 0;
  let threeBlack = 0;
  let fourBlack = 0;
  let fiveBlack = 0;
  let blackoutWins = 0;
  let twoBlackWins = 0;
  let threeBlackWins = 0;
  let fourBlackWins = 0;
  let fiveBlackWins = 0;
  let rate = 0;
  let mvpRate = 0;
  let svpRate = 0;
  let blackMvp = 0;
  let blackSvp = 0;
  let kills = 0;
  let deaths = 0;
  let assists = 0;
  let game_score = 0;
  let avgkills = 0;
  let avgDeaths = 0;
  let avgAssists = 0;
  let avgGame_score = 0;

  const pattern = /\d+\((\d+-\d+-\d+)\)/;
  const pattern1 = /<br>(.+)(?=\()/;
  effectiveCompetition.forEach(v => {
    v.openId = battleInfo.openId;
    v.areaId = battleInfo.areaId;
    const match = v.title.match(pattern);
    if (match.length) {
      const k_d_a = match[1];
      const kdaList = k_d_a.split("-");
      kills += Number(kdaList[0]);
      deaths += Number(kdaList[1]);
      assists += Number(kdaList[2]);
    }
    const match1 = v.title.match(pattern1);
    if (match1.length) {
      game_score += Number(match1[1]);
    }
    if (v.isWin === 1) {
      wins += 1;
    } else {
      losses += 1;
    }
    if (v.wasMvp) {
      mvp += 1;
    }
    if (v.wasSvp) {
      svp += 1;
    }
    const winSlogan = ["双剑合璧", "桃园三杰", "四大天王", "五子登科"];
    const lossSlogan = ["自行车", "三蹦子", "面包车", "满载SUV"];
    const allSlogan = [...winSlogan, ...lossSlogan];
    if (allSlogan.some(x => v.title.includes(x))) {
      blackoutTimes += 1;
      if (v.isWin === 1) {
        blackoutWins += 1;
      }
      if (v.wasMvp) {
        blackMvp += 1;
      }
      if (v.wasSvp) {
        blackSvp += 1;
      }
      if (v.title.includes("双剑合璧")) {
        twoBlack += 1;
        twoBlackWins += 1;
      }
      if (v.title.includes("自行车")) {
        twoBlack += 1;
      }
      if (v.title.includes("桃园三杰")) {
        threeBlack += 1;
        threeBlackWins += 1;
      }
      if (v.title.includes("三蹦子")) {
        threeBlack += 1;
      }
      if (v.title.includes("四大天王")) {
        fourBlack += 1;
        fourBlackWins += 1;
      }
      if (v.title.includes("面包车")) {
        fourBlack += 1;
      }
      if (v.title.includes("五子登科")) {
        fiveBlack += 1;
        fiveBlackWins += 1;
      }
      if (v.title.includes("满载SUV")) {
        fiveBlack += 1;
      }
    }
  });
  if (totalGames) {
    rate = ((wins / totalGames) * 100).toFixed(2);
    mvpRate = ((mvp / totalGames) * 100).toFixed(2);
    svpRate = ((svp / totalGames) * 100).toFixed(2);
    avgkills = +(kills / totalGames).toFixed(0);
    avgDeaths = +(deaths / totalGames).toFixed(0);
    avgAssists = +(assists / totalGames).toFixed(0);
    avgGame_score = +(game_score / totalGames).toFixed(1);
  }
  const recordData = {
    effectiveCompetition,
    startTime,
    totalGames,
    rate,
    mvpRate,
    svpRate,
    wins,
    losses,
    mvp,
    svp,
    matchNum,
    aramNum,
    rankNum,
    teamNum,
    blackoutTimes,
    twoBlack,
    threeBlack,
    fourBlack,
    fiveBlack,
    blackoutWins,
    twoBlackWins,
    threeBlackWins,
    fourBlackWins,
    fiveBlackWins,
    blackMvp,
    blackSvp,
    avgkills,
    avgDeaths,
    avgAssists,
    avgGame_score,
  };
  return recordData;
}

export function handlerso1Data(source) {
  console.log("来源", source);
  let baseInfo = {
    iconId: source?.baseInfo?.profileIconId ?? source.icon_id,
    name: source.label,
    level: source?.baseInfo?.level,
    puuid: source?.baseInfo?.puuid,
    privacy: source?.baseInfo?.privacy,
    lastGameDate: source?.baseInfo?.lastGameDate,
    wins: 0,
    losses: 0,
    netVictoryField: 0,
    kills: 0,
    deaths: 0,
    assists: 0,
    totalGames: 0,
    damageMax: 0,
    defenseMax: 0,
    killsMax: 0,
    assistsMax: 0,
    pentaKills: 0,
  };
  // 过滤损友
  const harmfulFriend = source.allrequestParams
    .filter(v => v.label !== source.label)
    .map(v => ({
      ...v,
      netVictoryField: 0,
      wins: 0,
      losses: 0,
      totalGames: 0,
    }));
  // console.log("harmfulFriend", harmfulFriend);

  // 战绩是否隐藏
  const publicInfo = source.baseInfo?.privacy === "PUBLIC" ? "公开" : "隐藏";
  // 最后的游戏时间
  const onlineInfo = parseTime(source.baseInfo?.lastGameDate - 8 * 3600 * 1000);
  // 最新一局比赛
  const firstGame = source.list[0];
  if (firstGame) {
    const firstYours = firstGame?.participants.find(
      x => x.puuid === source.baseInfo?.puuid
    );
    baseInfo.name = firstYours?.riotIdGameName;
    baseInfo.tagLine = firstYours?.riotIdTagline;
    baseInfo.nameInfoNew = `${firstYours?.riotIdGameName}#${firstYours?.riotIdTagline}`;
    // 第一局的时间
    const gameStartTimestamp =
      source.list[source.list.length - 1].gameStartTimestamp;
    const startTime = parseTime(gameStartTimestamp);
    let effectiveCompetition = source.list.filter(v => v.gameDuration > 180);
    // 按照日期过滤数据
    if (source.dataRange?.before) {
      effectiveCompetition = effectiveCompetition.filter(v => {
        const CompetitionTime = v.gameStartTimestamp;
        return (
          CompetitionTime >=
            new Date(
              `${source.dataRange?.before?.replaceAll("-", "/")} 00:00:00`
            ).getTime() &&
          CompetitionTime <
            new Date(
              `${source.dataRange?.after?.replaceAll("-", "/")} 00:00:00`
            ).getTime() +
              1000 * 3600 * 24
        );
      });
    }

    // 按照比赛类型过滤数据
    if (source.competitionType === "6") {
      effectiveCompetition = effectiveCompetition.filter(
        v =>
          ![
            31, 32, 33, 34, 35, 36, 52, 800, 801, 810, 820, 1830, 840, 850, 870,
            890,
          ].includes(v.queueId)
      );
    }
    // 你的所有队友和对手
    const yourMatchPlayersList = [];
    const list = effectiveCompetition.map(v => {
      baseInfo.platformId = v.platformId;
      baseInfo.areaId = platform2areaId[v.platformId];
      const yours = v.participants.find(
        x => x.puuid === source.baseInfo?.puuid
      );
      const yourIndex = v.participants.findIndex(
        x => x.puuid === source.baseInfo?.puuid
      );
      // console.log("你的index", yourIndex);
      const yourMatchPlayers = v.participants
        .map((v, i) => {
          const isYourTeam =
            (yourIndex < 5 && i < 5) || (yourIndex >= 5 && i >= 5);
          return {
            ...v,
            isYourTeam,
            totalGames: 1,
            teamSession: isYourTeam ? 1 : 0,
            teamWins: isYourTeam ? (v.win ? 1 : 0) : 0,
            opponentSession: isYourTeam ? 0 : 1,
            opponentWins: isYourTeam ? 0 : v.win ? 0 : 1,
          };
        })
        .filter(x => x.puuid !== source.baseInfo?.puuid);
      if (yourMatchPlayersList.length) {
        yourMatchPlayers.forEach(v => {
          const has = yourMatchPlayersList.findIndex(x => x.puuid === v.puuid);
          if (has === -1) {
            yourMatchPlayersList.push(v);
          } else {
            yourMatchPlayersList[has].totalGames += 1;
            if (v.isYourTeam) {
              yourMatchPlayersList[has].teamSession += 1;
              yourMatchPlayersList[has].teamWins = v.win
                ? yourMatchPlayersList[has].teamWins + 1
                : yourMatchPlayersList[has].teamWins;
            } else {
              yourMatchPlayersList[has].opponentSession += 1;
              yourMatchPlayersList[has].opponentWins = v.win
                ? yourMatchPlayersList[has].opponentWins
                : yourMatchPlayersList[has].opponentWins + 1;
            }
          }
        });
      } else {
        yourMatchPlayersList.push(...yourMatchPlayers);
      }
      // console.log(
      //   "你的队友",
      //   yourMatchPlayersList.filter(v => v.totalGames > 1)
      // );
      harmfulFriend.forEach(y => {
        const hasYour = v.participants.find(
          x => x.riotIdGameName === y.label && x.riotIdTagline === y.tagLine
        );
        if (hasYour) {
          y.totalGames += 1;
          y.wins = hasYour.win ? y.wins + 1 : y.wins;
          y.losses = hasYour.win ? y.losses : y.losses + 1;
          y.netVictoryField = hasYour.win
            ? y.netVictoryField + 1
            : y.netVictoryField - 1;
        }
      });
      baseInfo = {
        ...baseInfo,
        wins: yours.win ? baseInfo.wins + 1 : baseInfo.wins,
        losses: yours.win ? baseInfo.losses : baseInfo.losses + 1,
        netVictoryField: yours.win
          ? baseInfo.netVictoryField + 1
          : baseInfo.netVictoryField - 1,
        kills: baseInfo.kills + yours.kills,
        deaths: baseInfo.deaths + yours.deaths,
        assists: baseInfo.assists + yours.assists,
      };
      // 伤害最高index
      let damageMaxIndex = 0;
      // 承伤最高index
      let defenseMaxIndex = 0;
      // 人头最多index
      let killsMaxIndex = 0;
      // 助攻最多index
      let assistsMaxIndex = 0;
      const participants = v.participants?.map((x, i) => {
        const perks1 = x.perks?.styles?.[0]?.selections?.[0]?.perk;
        const perks2 = x.perks?.styles?.[1]?.style;
        const damageAll =
          x.physicalDamageDealtToChampions +
          x.magicDamageDealtToChampions +
          x.trueDamageDealtToChampions;
        const bearingInjuries =
          x.physicalDamageTaken + x.magicDamageTaken + x.trueDamageTaken;
        x.damageAll = damageAll;
        if (damageAll > v.participants[damageMaxIndex].damageAll) {
          damageMaxIndex = i;
        }

        x.bearingInjuries = bearingInjuries;
        if (bearingInjuries > v.participants[defenseMaxIndex].bearingInjuries) {
          defenseMaxIndex = i;
        }
        if (x.kills > v.participants[killsMaxIndex].kills) {
          killsMaxIndex = i;
        }
        if (x.assists > v.participants[assistsMaxIndex].assists) {
          assistsMaxIndex = i;
        }

        return {
          ...pick(x, [
            "win",
            "championId",
            "spell1Id",
            "spell2Id",
            "item0",
            "item1",
            "item2",
            "item3",
            "item4",
            "item5",
            "item6",
            "riotIdGameName",
            "riotIdTagline",
            "kills",
            "deaths",
            "assists",
            "pentaKills",
          ]),
          perks1,
          perks2,
          damageAll,
          bearingInjuries,
        };
      });
      participants[damageMaxIndex].damageMax = true;
      participants[defenseMaxIndex].defenseMax = true;
      participants[killsMaxIndex].killsMax = true;
      participants[assistsMaxIndex].assistsMax = true;
      const yoursIndex = v.participants.findIndex(
        x => x.puuid === source.baseInfo?.puuid
      );
      const mys = participants[yoursIndex];
      // 计算总的助攻次数，火盾次数
      baseInfo = {
        ...baseInfo,
        damageMax: mys?.damageMax ? baseInfo.damageMax + 1 : baseInfo.damageMax,
        defenseMax: mys?.defenseMax
          ? baseInfo.defenseMax + 1
          : baseInfo.defenseMax,
        killsMax: mys?.killsMax ? baseInfo.killsMax + 1 : baseInfo.killsMax,
        assistsMax: mys?.assistsMax
          ? baseInfo.assistsMax + 1
          : baseInfo.assistsMax,
        pentaKills: mys?.pentaKills + baseInfo.pentaKills,
      };
      return {
        ...pick(v, [
          "gameStartTimestamp",
          "queueId",
          "gameDuration",
          "platformId",
        ]),
        ...pick(yours, [
          "championId",
          "win",
          "kills",
          "deaths",
          "assists",
          "profileIcon",
          "riotIdGameName",
          "pentaKills",
        ]),
        damageMax: mys?.damageMax,
        defenseMax: mys?.defenseMax,
        killsMax: mys?.killsMax,
        assistsMax: mys?.assistsMax,
        participants,
      };
    });
    baseInfo.totalGames = list.length;
    if (baseInfo.totalGames) {
      baseInfo.rate = ((baseInfo.wins / baseInfo.totalGames) * 100).toFixed(2);
      baseInfo.avgkills = +(baseInfo.kills / baseInfo.totalGames).toFixed(0);
      baseInfo.avgDeaths = +(baseInfo.deaths / baseInfo.totalGames).toFixed(0);
      baseInfo.avgAssists = +(baseInfo.assists / baseInfo.totalGames).toFixed(
        0
      );
    }
    console.log("新列表", list, baseInfo);
    const sortHarmfulFriend = harmfulFriend
      .filter(v => v.totalGames)
      .sort((a, b) => b.netVictoryField - a.netVictoryField);
    console.log("排序损友", sortHarmfulFriend);
    const match2PlayersList = yourMatchPlayersList
      .filter(v => v.totalGames > 2)
      .sort((a, b) => b.totalGames - a.totalGames);
    return {
      ...baseInfo,
      list,
      startTime,
      publicInfo,
      onlineInfo,
      sortHarmfulFriend,
      yourMatchPlayersList: match2PlayersList,
    };
  } else {
    return {
      ...baseInfo,
      list: [],
      publicInfo,
      onlineInfo,
    };
  }
}

export function handlerMerge(source) {
  const mergeListStr = uni.getStorageSync("mergeList");
  let mergeList = [];
  try {
    if (mergeListStr && Array.isArray(JSON.parse(mergeListStr))) {
      mergeList = JSON.parse(mergeListStr);
    }
  } catch (error) {
    console.log("合并数据有问题", error);
  }
  if (!mergeList.length) {
    return source;
  }
  console.log("即将合并", source);

  const newList = source
    .map(v => {
      let newTarget = v;
      const mergeSingleArr = mergeList.filter(x => x.target === v.value);
      if (mergeSingleArr?.length) {
        mergeSingleArr.forEach(mergeSingle => {
          const sourceOne = source.find(y => y.value === mergeSingle.source);
          if (sourceOne) {
            newTarget = {
              ...newTarget,
              onlineInfo:
                newTarget.onlineInfo > sourceOne.onlineInfo
                  ? newTarget.onlineInfo
                  : sourceOne.onlineInfo,
              lastGameDate:
                newTarget.lastGameDate > sourceOne.lastGameDate
                  ? newTarget.lastGameDate
                  : sourceOne.lastGameDate,
              currentGame: newTarget.currentGame?.gameName
                ? newTarget.currentGame
                : sourceOne.currentGame,
              wins: newTarget.wins + sourceOne.wins,
              losses: newTarget.losses + sourceOne.losses,
              netVictoryField:
                newTarget.netVictoryField + sourceOne.netVictoryField,
              kills: newTarget.kills + sourceOne.kills,
              deaths: newTarget.deaths + sourceOne.deaths,
              assists: newTarget.assists + sourceOne.assists,
              totalGames: newTarget.totalGames + sourceOne.totalGames,
              startTime:
                newTarget.startTime > sourceOne.startTime
                  ? newTarget.startTime
                  : sourceOne.startTime,
              damageMax: newTarget.damageMax + sourceOne.damageMax,
              defenseMax: newTarget.defenseMax + sourceOne.defenseMax,
              killsMax: newTarget.killsMax + sourceOne.killsMax,
              assistsMax: newTarget.assistsMax + sourceOne.assistsMax,
              pentaKills: newTarget.pentaKills + sourceOne.pentaKills,
              sortHarmfulFriend: [
                ...(newTarget.sortHarmfulFriend ?? []),
                ...(sourceOne.sortHarmfulFriend ?? []),
              ],
              list: [...newTarget.list, ...sourceOne.list],
            };
          }
        });
        newTarget = {
          ...newTarget,
          rate: ((newTarget.wins / newTarget.totalGames) * 100).toFixed(2),
          avgkills: +(newTarget.kills / newTarget.totalGames).toFixed(0),
          avgDeaths: +(newTarget.deaths / newTarget.totalGames).toFixed(0),
          avgAssists: +(newTarget.assists / newTarget.totalGames).toFixed(0),
        };
        const sortHarmfulFriend = newTarget.sortHarmfulFriend?.sort(
          (a, b) => b.netVictoryField - a.netVictoryField
        );
        newTarget.sortHarmfulFriend = sortHarmfulFriend;
        const list = newTarget.list.sort(
          (a, b) => b.gameStartTimestamp - a.gameStartTimestamp
        );
        newTarget.list = list;
      }
      return newTarget;
    })
    .filter(v => !mergeList.map(x => x.source).includes(v.value));
  return newList;
}

export function handlerMergeOld(source) {
  const mergeListStr = uni.getStorageSync("mergeList");
  let mergeList = [];
  try {
    if (mergeListStr && Array.isArray(JSON.parse(mergeListStr))) {
      mergeList = JSON.parse(mergeListStr);
    }
  } catch (error) {
    console.log("合并数据有问题", error);
  }
  if (!mergeList.length) {
    return source;
  }
  console.log("即将合并", source);

  const newList = source
    .map(v => {
      let newTarget = v;
      const mergeSingleArr = mergeList.filter(x => x.target === v.value);
      if (mergeSingleArr?.length) {
        mergeSingleArr.forEach(mergeSingle => {
          const sourceOne = source.find(y => y.value === mergeSingle.source);
          if (sourceOne) {
            newTarget = {
              ...newTarget,
              onlineInfo:
                newTarget.onlineInfo > sourceOne.onlineInfo
                  ? newTarget.onlineInfo
                  : sourceOne.onlineInfo,
              curryMap: newTarget.curryMap ?? sourceOne.curryMap,
              wins: newTarget.wins + sourceOne.wins,
              losses: newTarget.losses + sourceOne.losses,
              blackoutWins: newTarget.blackoutWins + sourceOne.blackoutWins,
              blackoutTimes: newTarget.blackoutTimes + sourceOne.blackoutTimes,
              blackMvp: newTarget.blackMvp + sourceOne.blackMvp,
              blackSvp: newTarget.blackSvp + sourceOne.blackSvp,
              totalGames: newTarget.totalGames + sourceOne.totalGames,
              mvp: newTarget.mvp + sourceOne.mvp,
              svp: newTarget.svp + sourceOne.svp,
              twoBlackWins: newTarget.twoBlackWins + sourceOne.twoBlackWins,
              twoBlack: newTarget.twoBlack + sourceOne.twoBlack,
              threeBlackWins:
                newTarget.threeBlackWins + sourceOne.threeBlackWins,
              threeBlack: newTarget.threeBlack + sourceOne.threeBlack,
              fourBlackWins: newTarget.fourBlackWins + sourceOne.fourBlackWins,
              fourBlack: newTarget.fourBlack + sourceOne.fourBlack,
              fiveBlackWins: newTarget.fiveBlackWins + sourceOne.fiveBlackWins,
              fiveBlack: newTarget.fiveBlack + sourceOne.fiveBlack,
              startTime:
                newTarget.startTime > sourceOne.startTime
                  ? newTarget.startTime
                  : sourceOne.startTime,
              data: [...newTarget.data, ...sourceOne.data],
              effectiveCompetition: [
                ...newTarget.effectiveCompetition,
                ...sourceOne.effectiveCompetition,
              ],
            };
          }
        });
        newTarget = {
          ...newTarget,
          rate: ((newTarget.wins / newTarget.totalGames) * 100).toFixed(2),
        };
        const effectiveCompetition = newTarget.effectiveCompetition.sort(
          (a, b) => {
            if (b.titleTime > a.titleTime) {
              return 1;
            } else {
              return -1;
            }
          }
        );
        newTarget.effectiveCompetition = effectiveCompetition;
      }
      return newTarget;
    })
    .filter(v => !mergeList.map(x => x.source).includes(v.value));
  return newList;
}

export function getBaseUrl() {
  const idx = uni.getStorageSync("baseUrl");
  const baseUrl = baseUrlList?.[idx]?.value ?? lzyumiA;
  return baseUrl;
}

// 日期格式化
export function parseTime(time, pattern) {
  if (arguments.length === 0 || !time) {
    return null;
  }
  const format = pattern || "{y}-{m}-{d} {h}:{i}:{s}";
  let date;
  if (typeof time === "object") {
    date = time;
  } else {
    if (typeof time === "string" && /^[0-9]+$/.test(time)) {
      time = parseInt(time);
    } else if (typeof time === "string") {
      time = time
        .replace(new RegExp(/-/gm), "/")
        .replace("T", " ")
        .replace(new RegExp(/\.[\d]{3}/gm), "");
    }
    if (typeof time === "number" && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === "a") {
      return ["日", "一", "二", "三", "四", "五", "六"][value];
    }
    if (result.length > 0 && value < 10) {
      value = "0" + value;
    }
    return value || 0;
  });
  return time_str;
}

export function secondsToHms(seconds) {
  if (seconds === 0) return "0s";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(hours + "时");
  if (minutes > 0) parts.push(minutes + "分");
  if (secs > 0) parts.push(secs + "秒");

  return parts.join("");
}

export function timePassed(timer) {
  const timestamp = Date.now() - timer;
  const minutes = timestamp / (1000 * 60);
  // 取整
  const roundedMinutes = Math.floor(minutes);
  return roundedMinutes;
}

export function getGuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function navigateToWithLimit(options) {
  // 获取当前页面栈
  const pages = getCurrentPages();

  // 判断页面栈长度是否超过10
  if (pages.length >= 9) {
    // 关闭最旧的页面
    uni.navigateBack({
      delta: pages.length - 1, // 返回的层级数，返回到最旧的页面
      success() {
        // 跳转到新页面
        uni.navigateTo({
          ...options,
          success() {
            console.log("跳转成功");
          },
          fail(err) {
            console.error("跳转失败", err);
          },
        });
      },
      fail(err) {
        console.error("返回失败", err);
      },
    });
  } else {
    // 页面栈长度未超过10，直接跳转到新页面
    uni.navigateTo({
      ...options,
      success() {
        console.log("跳转成功");
      },
      fail(err) {
        console.error("跳转失败", err);
      },
    });
  }
}

export function yundingDataProcessing(source) {
  const nameInfoNew = source.battleInfo.nameInfoNew;
  const mapOneInfoList = source.battleInfo.mapOneInfoList;
  const Ranking = mapOneInfoList;
  let rankingTotal = 0;
  let rankingWins = 0;
  Ranking.forEach(rank => {
    rankingTotal += rank.total;
    rankingWins += rank.wins;
  });
  const rankingData = {
    wins: rankingWins,
    total: rankingTotal,
    losses: rankingTotal - rankingWins,
    netWin: rankingWins * 2 - rankingTotal,
    rate: ((rankingWins / rankingTotal) * 100).toFixed(2),
  };
  const pattern1 = /^(.*?)#(\d+)$/;
  const name = nameInfoNew.match(pattern1)[1];
  const tagLine = nameInfoNew.match(pattern1)[2];
  let data = source.data;
  let totalGames = data?.length;
  // 第一局的时间
  const titleTime = data[data.length - 1].end_time;
  let startTime = parseTime(`${titleTime}000`, "{m}-{d} {h}:{i}");
  // 最后一局的时间
  const titleLastTime = data[0].end_time;
  let endTime = parseTime(`${titleLastTime}000`, "{m}-{d} {h}:{i}");
  if (data?.[0]?.titleTime) {
    totalGames = undefined;
    startTime = undefined;
    endTime = undefined;
    data = [];
  }
  return {
    ...source,
    ...source.battleInfo,
    name,
    tagLine,
    totalGames,
    startTime,
    endTime,
    data,
  };
}

export function getScore(score) {
  if (score == 1) {
    return "SSS";
  } else if (score == 2) {
    return "SS";
  } else if (score == 3) {
    return "S";
  } else if (score == 4) {
    return "A";
  } else if (score == 5) {
    return "B";
  } else if (score == 6) {
    return "C";
  } else if (score == 7) {
    return "D";
  } else {
    return "S";
  }
}

export function getRanking(ranking) {
  if (ranking == 1) {
    return "一";
  } else if (ranking == 2) {
    return "二";
  } else if (ranking == 3) {
    return "三";
  } else if (ranking == 4) {
    return "四";
  } else if (ranking == 5) {
    return "五";
  } else if (ranking == 6) {
    return "六";
  } else if (ranking == 7) {
    return "七";
  } else if (ranking == 8) {
    return "八";
  } else {
    return "零";
  }
}
