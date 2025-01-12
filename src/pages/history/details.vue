<template>
  <view
    class="max-w-screen-md mx-auto overflow-y-auto bg-slate-50 h-full flex flex-col"
  >
    <view class="history-details">
      <view class="flex justify-between items-center p-1 bg-blue-100">
        <view class="flex items-center">
          <LolAvartar
            @click="getHistoryDetails"
            :size="40"
            :loading="loading"
            :iconId="
              userHistoryDetails1.profileIcon ??
              userHistory.iconId ??
              userHistory.profileIcon
            "
          />
          <view>
            <uv-tooltip
              class="ml-2 text-base"
              color="#000"
              size="1rem"
              :text="userHistory.nameInfoNew ?? userHistory.riotIdGameName"
              overlay
              direction="bottom"
            ></uv-tooltip>
            <!-- <text class="ml-2 text-base">
              {{ userHistory.nameInfoNew ?? userHistory.riotIdGameName }}
            </text> -->
            <view>
              <text class="ml-2 text-sm">
                {{
                  userHistoryDetails1.fullDate ??
                  parseTime(userHistoryDetails1.gameStartTimestamp)
                }}
              </text>
              <text class="ml-2 text-sm">
                {{
                  userHistoryDetails1.competitionType ??
                  levelConfig.game_mod[userHistoryDetails1.queueId]
                }}
              </text>
              <text class="ml-2 text-sm">
                {{
                  userHistoryDetails1.competitionDuration ??
                  secondsToHms(userHistoryDetails1.gameDuration)
                }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <view
        class="p-2 m-1 rounded-md"
        v-for="(item, index) in gameData.teamDetails"
        :key="index"
        :class="{
          'bg-green-100': item.win === 'Win',
          'bg-red-100': item.win === 'Fail',
        }"
      >
        <view class="flex items-center">
          <view
            class="flex items-center team-info text-sm"
            v-for="(game, gameIndex) in getGameInfo(item)"
            :key="gameIndex"
          >
            <text :class="game.icon"></text>
            <text>{{ game.value }}</text>
          </view>
        </view>

        <view class="flex items-center mt-2 text-sm">
          <text>团队ELO：{{ item.teamElo }}</text>
          <text
            class="ml-2 text-white text-xs p-1 shadow-sm shadow-blue-100"
            :style="{ background: getGameLevel(item.teamElo).backgroundColor }"
          >
            {{ getGameLevel(item.teamElo).level }}
          </text>
        </view>

        <view class="mt-2">
          <view
            class="mt-2"
            v-for="(player, playerIndex) in getGamePlayers(item)"
            :key="playerIndex"
          >
            <view class="flex">
              <view class="shrink-0">
                <HeroAvatar
                  :championId="player.detailChampionId"
                  :wasMvp="player.wasMvp"
                  :wasSvp="player.wasSvp"
                  :size="32"
                />
                <view class="mt-0.5 text-sm text-center">
                  {{ player.scoreInfoNum }}
                </view>
              </view>

              <view class="ml-1">
                <LolAbility :iconId="player.detailRune1" />
                <LolAbility class="mt-1" :iconId="player.detailRune2" />
              </view>

              <view class="ml-1">
                <LolRunesperk :iconId="player.detailSperk1" />
                <LolRunesperk class="mt-1" :iconId="player.detailSperk2" />
              </view>

              <view class="ml-1 w-full">
                <view class="flex">
                  <view v-for="equipIndex in 7" :key="equipIndex">
                    <LolEquip :iconId="player[`zhuangbei${equipIndex}`]" />
                  </view>
                </view>

                <view class="mt-1 text-sm flex justify-between">
                  <text
                    @click="goHistoryList(player)"
                    class="cursor-pointer"
                    :class="{
                      'text-fuchsia-500': player.nickName?.includes(
                        userHistory.name
                      ),
                    }"
                  >
                    {{ player.nickName }}
                  </text>
                  <text class="ml-1 text-blue-400">
                    {{ areaMap[player.translateAreaId]?.name }}
                  </text>
                </view>
              </view>
            </view>
            <view class="text-sm">
              <text class="ml-1 text-blue-400">{{ player.scoreInfo }}</text>
              <text class="ml-1">
                <text class="text-sm">攻</text>
                <text>{{ player.totalDamageDealt }}k</text>
              </text>
              <text class="ml-1">
                <text class="text-sm">承</text>
                <text>
                  {{
                    (player?.echartsMap?.totalDamageTaken / 1000).toFixed(1)
                  }}k
                </text>
              </text>
              <i
                v-for="item in player.biaoxianInfo"
                :key="item"
                :class="`honor16-${item}`"
                class="ml-2 common-icon honor16"
              ></i>
              <text
                class="ml-1"
                :style="{ color: getRankColor(player.duanweiInfo) }"
              >
                {{ player.duanweiInfo }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <template v-if="userHistoryDetails1.participants">
        <view class="mt-2">
          <view
            class="flex pt-2"
            :class="{
              'bg-green-100': player.win,
              'bg-red-100': !player.win,
              'mt-2': playerIndex === 5,
            }"
            v-for="(player, playerIndex) in userHistoryDetails1.participants"
            :key="playerIndex"
          >
            <view>
              <HeroAvatar
                :championId="player.championId"
                :damageMax="player.damageMax"
                :defenseMax="player.defenseMax"
                :killsMax="player.killsMax"
                :assistsMax="player.assistsMax"
                :pentaKills="player.pentaKills > 0"
                :size="32"
              />
            </view>

            <view class="ml-1">
              <LolAbility :iconId="player.spell1Id" />
              <LolAbility class="mt-1" :iconId="player.spell2Id" />
            </view>

            <view class="ml-1">
              <LolRunesperk :iconId="player.perks1" />
              <LolRunesperk class="mt-1" :iconId="player.perks2" />
            </view>

            <view class="ml-1">
              <view class="flex">
                <view v-for="equipIndex in 7" :key="equipIndex">
                  <LolEquip :iconId="player[`item${equipIndex - 1}`]" />
                </view>
              </view>

              <view class="mt-1 text-sm">
                <text
                  @click="goSO1HistoryList(player)"
                  class="cursor-pointer"
                  :class="{
                    'text-fuchsia-500': player.riotIdGameName?.includes(
                      userHistoryDetails1.riotIdGameName
                    ),
                  }"
                >
                  {{ player.riotIdGameName }}
                </text>
                <text class="ml-1 text-blue-400">
                  {{ `${player.kills}/${player.deaths}/${player.assists}` }}
                </text>
                <text class="ml-1">
                  <text class="text-sm">攻</text>
                  <text :class="{ 'text-red-500': player.damageMax }">
                    {{ (player.damageAll / 1000).toFixed(1) }}k
                  </text>
                </text>
                <text class="ml-1">
                  <text class="text-sm">承</text>
                  <text :class="{ 'text-cyan-500': player.defenseMax }">
                    {{ (player.bearingInjuries / 1000).toFixed(1) }}k
                  </text>
                </text>
              </view>
            </view>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import LolEquip from "@/components/LolEquip.vue";
import LolAvartar from "@/components/LolAvartar.vue";
import HeroAvatar from "@/components/HeroAvatar.vue";
import LolAbility from "@/components/LolAbility.vue";
import LolRunesperk from "@/components/LolRunesperk.vue";
import {
  searchPlayerHistory,
  searchPlayerAll,
  leagueSummoner,
  history_all,
  spectator_info,
} from "@/axios/api";
import {
  getSign,
  dataProcessing,
  parseTime,
  secondsToHms,
  handlerso1Data,
  navigateToWithLimit,
} from "@/utils/auth";
import screenshot from "@/utils/screenshot";
import { areaMap, levelConfig, platformMap } from "@/utils/area.js";
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

function goHistoryList(player) {
  console.log("玩家", player);
  const { name: areaName } = areaMap[player.translateAreaId];
  loading.value = true;
  searchPlayerAll({
    nickname: player.nickName?.replace("#", "*~*~*"),
    allCount: 10,
    areaId: player.translateAreaId,
    areaName,
    openId: player.openIdNow,
    seleMe: 1,
    filter: 1,
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
      const newData = dataProcessing(res);
      historyStore.setSingleData(newData);
      console.log("新格式", newData);
      navigateToWithLimit({
        url: "/pages/index/index?activeTab=0",
      });
    })
    .finally(() => {
      loading.value = false;
    });
}

async function goSO1HistoryList(player) {
  if (
    !(
      userHistoryDetails1.value?.platformId &&
      player.riotIdGameName &&
      player.riotIdTagline
    )
  ) {
    return;
  }
  const userHistoryDetails = historyStore.historyDetail ?? {};
  const area = platformMap[userHistoryDetails.platformId];
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

const userHistoryDetails1 = ref({});

async function getHistoryDetails() {
  console.log("打印下", userHistoryDetails1.value);
  if (!userHistoryDetails1.value.gameId) {
    return;
  }
  loading.value = true;

  try {
    const resp = await searchPlayerHistory({
      openId: userHistoryDetails1.value.openId,
      gameId: userHistoryDetails1.value.gameId,
      areaId: userHistoryDetails1.value.areaId,
      ...getSign(),
    });
    const res = resp.data;

    if (!res?.data) {
      uni.showToast({
        title: "查询数据失败，请重试",
        icon: "error",
      });
      return;
    }

    historyStore.setHistoryDetailObj({
      gameId: userHistoryDetails1.value.gameId,
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
  const userHistoryDetails = historyStore.historyDetail ?? {};
  userHistory.value = historyStore.historyList ?? {};
  console.log("出发了吗", userHistoryDetails, userHistory.value);
  loading.value = false;
  // 比赛时间
  if (userHistoryDetails.gameId) {
    const reg = /^\d{2}-\d{2}/;
    const fullDate = reg.test(userHistoryDetails.titleTime)
      ? `${userHistoryDetails.titleTime.slice(0, 11)}`
      : userHistoryDetails.titleTime.slice(4, 16);
    // 比赛类型
    const reg1 = /^(.*?)(?=\()/;
    const competitionType = userHistoryDetails?.title?.match(reg1)?.[0];
    const reg2 = /用时(.*?)(?=<br>)/;
    const competitionDuration = userHistoryDetails?.title?.match(reg2)?.[0];
    userHistoryDetails1.value = {
      ...userHistoryDetails,
      fullDate,
      competitionType,
      competitionDuration,
    };
    // 相同gameId不请求
    if (!Reflect.has(gameDetails, userHistoryDetails.gameId)) {
      getHistoryDetails();
    } else {
      gameData.value = gameDetails[userHistoryDetails.gameId]?.data;
      loading.value = false;
    }
  } else {
    userHistoryDetails1.value = { ...userHistoryDetails };
  }
});
</script>

<style lang="scss" scoped>
.team-info + .team-info {
  margin-left: 6px;
}
</style>
