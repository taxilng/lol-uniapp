<template>
  <view
    class="max-w-screen-md mx-auto overflow-y-auto bg-slate-50 h-full flex flex-col"
  >
    <view class="history-details">
      <view
        class="flex justify-between items-center p-1 bg-blue-100"
        @click="getHistoryDetails"
      >
        <view class="flex items-center">
          <LolAvartar
            :size="40"
            :loading="loading"
            :iconId="
              userHistoryDetails.profileIcon ??
              userHistory.iconId ??
              userHistory.profileIcon
            "
          />
          <view>
            <text class="ml-2 text-base">{{
              userHistoryDetails.riotIdGameName ??
              userHistory.name ??
              userHistory.riotIdGameName
            }}</text>
            <text class="ml-2 text-base">{{ gameData.set_name }}</text>
            <view>
              <text class="ml-2 text-sm">{{
                parseTime(`${gameData.end_time}000`)
              }}</text>
              <text class="ml-2 text-sm">{{
                secondsToHms(gameData.duration)
              }}</text>
            </view>
          </view>
        </view>
      </view>
      <view class="mt-2">
        <view
          class="flex pt-2 mb-2"
          v-for="(player, playerIndex) in gameData.member_exploit_list"
          :key="playerIndex"
        >
          <view class="px-2">
            <view>
              <ChessHeroAvatar :iconId="player.head_icon_id" :size="60" />
            </view>
            <view class="mt-1 text-sm">第{{ getRanking(player.ranking) }}</view>
          </view>

          <view class="ml-1 flex-1">
            <view class="flex flex-wrap">
              <view
                class="mb-3"
                v-for="(equipIndex, idx) in player.piece_list"
                :key="idx"
              >
                <ChessImages
                  v-if="equipIndex.piece_id"
                  :picture="equipIndex.picture"
                  :season="gameData.set_name"
                  :starNum="equipIndex.star_num"
                  :size="60"
                />
              </view>
            </view>

            <view class="flex justify-between mt-1 text-sm pr-2">
              <text
                @click="goHistoryList(player)"
                class="cursor-pointer"
                :class="{
                  'text-fuchsia-500': player.nickname?.includes(
                    userHistory.nameInfoNew
                  ),
                }"
                >{{ player.nickname }}</text
              >
              <text class="ml-1 text-blue-400">{{
                areaMap[player.areaId]?.name
              }}</text>
              <view>
                <img
                  v-if="player.game_rank_list?.[0]?.tier"
                  class="w-5 h-5 inline-block"
                  :src="`https://wegame.gtimg.com/g.26-r.c2d3c/helper/lol/v2/tier/tier-${player.game_rank_list?.[0]?.tier}.png`"
                />
                <text>
                  {{ levelConfig.tier?.[player.game_rank_list?.[0]?.tier] }}
                </text>
                <text>
                  {{ levelConfig.level?.[player.game_rank_list?.[0]?.rank] }}
                </text>
                <text>
                  {{ player.game_rank_list?.[0]?.league_points }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import LolAvartar from "@/components/LolAvartar.vue";
import ChessHeroAvatar from "@/components/ChessHeroAvatar.vue";
import ChessImages from "@/components/ChessImages.vue";
import {
  getYunDingDetailOneInfo,
  getYunDingDetailInfo,
  searchPlayerAll,
  leagueSummoner,
  history_all,
  spectator_info,
} from "@/axios/api";
import {
  getSign,
  yundingDataProcessing,
  parseTime,
  secondsToHms,
  handlerso1Data,
  navigateToWithLimit,
  getRanking,
} from "@/utils/auth";
import screenshot from "@/utils/screenshot";
import {
  areaMap,
  levelConfig,
  platformMap,
  S5ChessList,
} from "@/utils/area.js";
import { userHistoryStore } from "@/stores/userHistory";

const historyStore = userHistoryStore();
const userHistory = ref({});
const loading = ref(true);
const gameData = ref({
  teamDetails: [],
});

watch(
  gameData,
  val => {
    console.log("gameData", val);
  },
  { deep: true, immediate: true }
);

watch(
  loading,
  val => {
    console.log("我的加载值", val);
  },
  { deep: true, immediate: true }
);

// 段位颜色
const ranks = [
  { name: "黑铁", color: "#6A4F4B" },
  { name: "青铜", color: "#CD7F32" },
  { name: "白银", color: "#c3d4c9" },
  { name: "黄金", color: "#FFD700" },
  { name: "铂金", color: "#40E0D0" },
  { name: "翡翠", color: "#00916E" },
  { name: "钻石", color: "#338055" },
  { name: "大师", color: "#A250F5" },
  { name: "宗师", color: "#800080" },
  { name: "王者", color: "#FF0000" },
];

const getRankColor = tier => {
  return ranks.find(item => item.name === tier.slice(0, 2))?.color;
};

function idConvert(set_name, id) {
  // console.log("哇哈哈哈", set_name, id);

  if (set_name === "s5") {
    return S5ChessList.find(v => v.chessId === String(id))?.TFTID;
  }
  return id;
}

function goHistoryList(player) {
  console.log("玩家", player);
  const { name: areaName } = areaMap[player.areaId];
  loading.value = true;
  searchPlayerAll({
    nickname: player.nickname?.replace("#", "*~*~*"),
    allCount: 10,
    areaId: player.areaId,
    areaName,
    openId: player.openid,
    seleMe: 1,
    filter: 1,
    modelId: "2",
    openId: "",
    ...getSign(),
  })
    .then(resp => {
      let res = resp.data;
      // 有时候会包裹了2层JSON，需要再次解析下
      if (typeof res === "string") {
        try {
          res = JSON.parse(res);
        } catch (error) {
          uni.showToast({
            title: "解析JSON失败，数据有问题",
            icon: "error",
          });
        }
      }
      if (!res.data) {
        uni.showToast({
          title: "查询数据失败，请重试",
          icon: "error",
        });
        return;
      }
      if (res.code === 2) {
        uni.showToast({
          title: res?.data?.[0]?.titleTime,
          icon: "error",
        });
        return;
      }
      const newData = yundingDataProcessing(res);
      historyStore.setSingleYundingData(newData);
      console.log("新格式", newData);
      navigateToWithLimit({
        url: "/pages/index/index?activeTab=1",
      });
    })
    .finally(() => {
      loading.value = false;
    });
}

async function goSO1HistoryList(player) {
  if (
    !(
      userHistoryDetails.value?.platformId &&
      player.riotIdGameName &&
      player.riotIdTagline
    )
  ) {
    return;
  }
  const detail = historyStore.historyDetail ?? {};
  const area = platformMap[detail.platformId];
  try {
    loading.value = true;
    const res1 = await leagueSummoner({
      area,
      gameName: player.riotIdGameName,
      tagLine: player.riotIdTagline,
    });
    if (res1.data?.success === false) {
      uni.showToast({
        title: res1.data?.error?.message,
        icon: "error",
      });
    }
    const data = res1?.data?.data;
    const res2 = await history_all({
      area,
      puuid: data.puuid,
      beginIdx: 0,
      count: 20,
    });
    const res3 = await spectator_info({
      area,
      puuid: data.puuid,
    });
    let currentGame = {};
    if (res3.data.success && res3.data?.data) {
      const data = res3.data.data;
      const puuid = data.playerCredentials.puuid;
      const nameList = [...data.game.teamOne, ...data.game.teamTwo];
      const cur = nameList.find(v => v.puuid === puuid);
      const championId = cur?.championId;
      currentGame = {
        ...res3.data?.data,
        championId,
      };
    }
    console.log("返回返沪i", res1, res2);
    const recordData = {
      ...handlerso1Data({
        baseInfo: data,
        allrequestParams: [],
        list: res2.data?.data,
      }),
      currentGame,
    };
    historyStore.setSingleData(recordData);
    navigateToWithLimit({
      url: "/pages/index/index?activeTab=0",
    });
  } catch (error) {
    console.log("错误2", error);
  } finally {
    loading.value = false;
  }
}

function getGameInfo(item) {
  return [
    {
      label: "战绩",
      icon: "icon-data1",
      value: `击杀${item.totalKills}/死亡${item.totalDeaths}/助攻${item.totalAssists}`,
    },
    {
      label: "金币",
      icon: "icon-data2",
      value: item.totalGoldEarned,
    },
    {
      label: "防御塔",
      icon: "icon-data3",
      value: item.totalTurretsKilled,
    },
    {
      label: "兵营",
      icon: "icon-data4",
      value: item.totalDampenKilled,
    },
    {
      label: "大龙",
      icon: "icon-data5",
      value: item.totalDragonKills,
    },
    {
      label: "基地",
      icon: "icon-data6",
      value: item.totalDampenKilled,
    },
  ];
}
const shareLoading = ref(false);

function getGamePlayers(item) {
  return gameData.value.wgBattleDetailInfo.filter(
    v => v.teamId === item.teamId
  );
}

function getGameLevel(eloScore) {
  let backgroundColor;
  let level;
  if (eloScore < 400) {
    level = "黑铁混战记";
    backgroundColor = "#444444";
  } else if (eloScore < 800) {
    level = "青铜争锋录";
    backgroundColor = "#cd7f32";
  } else if (eloScore < 1200) {
    level = "白银对决篇";
    backgroundColor = "#c0c0c0";
  } else if (eloScore < 1600) {
    level = "黄金策略战";
    backgroundColor = "#ffd700";
  } else if (eloScore < 2000) {
    level = "铂金技艺赛";
    backgroundColor = "#e5e4e2";
  } else if (eloScore < 2400) {
    level = "翡翠博弈局";
    backgroundColor = "#50c878";
  } else if (eloScore < 2800) {
    level = "钻石巅峰战";
    backgroundColor = "#0090b1";
  } else {
    level = "大师传奇赛";
    backgroundColor = "#800080";
  }

  return {
    level,
    backgroundColor,
  };
}

const userHistoryDetails = ref({});

async function getHistoryDetails() {
  console.log("打印下", userHistoryDetails.value);
  if (!userHistoryDetails.value.game_id) {
    return;
  }
  loading.value = true;

  try {
    // const resp = await getYunDingDetailOneInfo({
    //   id: userHistory.value.openId,
    //   gameId: userHistoryDetails.value.game_id,
    //   area: userHistory.value.areaId,
    //   ...getSign(),
    // });
    // const res = resp.data;

    const resp1 = await getYunDingDetailInfo({
      id: userHistory.value.openId,
      gameId: userHistoryDetails.value.game_id,
      area: userHistory.value.areaId,
      areaName: areaMap[userHistory.value.areaId]?.name,
      ...getSign(),
    });
    const res = resp1.data;
    console.log("这个是res1", res);

    if (!res?.data) {
      uni.showToast({
        title: "查询数据失败，请重试",
        icon: "error",
      });
      return;
    }

    historyStore.setHistoryDetailObj({
      gameId: userHistoryDetails.value.game_id,
      value: res,
    });
    gameData.value = res.data;
  } catch (error) {
    console.log("错误", error);
  } finally {
    loading.value = false;
  }
}

function handleShare() {
  shareLoading.value = true;
  screenshot(".history-details", "战绩详情").finally(
    () => (shareLoading.value = false)
  );
}

onMounted(() => {
  const gameDetails = historyStore.historyDetailObj ?? {};
  const detail = historyStore.historyDetail ?? {};
  userHistory.value = historyStore.historyList ?? {};
  console.log("出发了吗", detail, userHistory.value);
  loading.value = false;
  userHistoryDetails.value = { ...detail };
  // 相同gameId不请求
  if (!Reflect.has(gameDetails, detail.game_id)) {
    getHistoryDetails();
  } else {
    gameData.value = gameDetails[detail.game_id]?.data;
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.team-info + .team-info {
  margin-left: 6px;
}
</style>
