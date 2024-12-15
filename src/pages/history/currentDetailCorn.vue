<template>
  <view
    class="max-w-screen-md mx-auto overflow-y-auto bg-slate-50 h-full flex flex-col"
  >
    <view class="history-details">
      <view class="flex justify-between items-center p-1 bg-blue-100">
        <view class="flex items-center">
          <LolAvartar :size="40" :iconId="userHistory.iconId" :loading="loading" />
          <view>
            <text class="ml-2 text-base">{{ userHistory.nameInfoNew }}</text>
            <text class="ml-2">{{
              userHistoryDetails?.titleTime?.slice(0, 12)
            }}</text>
            <view class="ml-2 text-xs text-slate-400">
              {{ userHistoryDetails?.title?.replace(/\u003Cbr\u003E/, "") }}
            </view>
          </view>
        </view>
      </view>

      <view
        class="p-1 rounded-md"
        v-for="(player, index) in gameData.wgBattleDetailInfo"
        :key="index"
        :class="{
          'bg-green-100': index < 5,
          'bg-red-100': index > 4,
          'mt-1': index === 5,
        }"
      >
        <view v-if="index === 0" class="flex items-center mt-2 mb-2 text-sm">
          <text>团队ELO：{{ gameData.teamEloOne }}</text>
          <text
            class="ml-2 text-white text-xs p-1 shadow-sm shadow-blue-100"
            :style="{
              background: getGameLevel(gameData.teamEloOne).backgroundColor,
            }"
          >
            {{ getGameLevel(gameData.teamEloOne).level }}
          </text>
        </view>
        <view v-if="index === 5" class="flex items-center mt-2 mb-2 text-sm">
          <text>团队ELO：{{ gameData.teamEloTwo }}</text>
          <text
            class="ml-2 text-white text-xs p-1 shadow-sm shadow-blue-100"
            :style="{
              background: getGameLevel(gameData.teamEloTwo).backgroundColor,
            }"
          >
            {{ getGameLevel(gameData.teamEloTwo).level }}
          </text>
        </view>

        <view @click="goHistoryList(player)">
          <view class="flex">
            <view>
              <HeroAvatar :championId="player.detailChampionId" :size="32" />
            </view>

            <view class="ml-1">
              <LolAbility size="40" :iconId="player.detailRune1" />
              <LolAbility size="40" class="mt-1" :iconId="player.detailRune2" />
            </view>

            <view class="ml-2 mr-3 flex-1">
              <view class="text-sm flex justify-between">
                <text
                  class="cursor-pointer"
                  :class="{
                    'text-fuchsia-500': player.nickName?.includes(
                      userHistory.name
                    ),
                  }"
                  >{{ player.nickName }}</text
                >
                <text class="ml-1" :style="{ color: player.nickNameColor }">{{
                  areaMap[player.translateAreaId]?.name
                }}</text>
              </view>
              <view class="mt-1 text-sm flex justify-between">
                <text :style="{ color: getRankColor(player.duanweiInfo) }">
                  {{ player.duanweiInfo }}
                </text>
                <text>
                  {{ player.gameTotleInfo }}
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
import HeroAvatar from "@/components/HeroAvatar.vue";
import LolAbility from "@/components/LolAbility.vue";
import { searchPlayerHistory, searchPlayerAll } from "@/axios/api";
import { getSign, dataProcessing, navigateToWithLimit } from "@/utils/auth";
import { areaMap, platformMap } from "@/utils/area.js";
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
          title: "error",
        });
        return;
      }
      const newData = dataProcessing(res);
      console.log("新格式", newData);
      historyStore.setSingleData(newData);
      navigateToWithLimit({
        url: "/pages/index/index?activeTab=0",
      });
    })
    .finally(() => {
      loading.value = false;
    });
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
  loading.value = true;
  try {
    const resp = await searchPlayerHistory({
      openId: userHistory.value.openId,
      gameId: userHistoryDetails.value.gameId,
      areaId: userHistory.value.areaId,
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
      gameId: userHistoryDetails.value.gameId,
      value:res
    });
    gameData.value = res.data;
    console.log("gameData.value", gameData.value);
  } catch (error) {
    console.log("错误", error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  userHistory.value = historyStore.historyList ?? {};
  userHistoryDetails.value = historyStore.historyDetail ?? {};
  console.log("userHistory", userHistory.value);
  console.log("userHistoryDetails", userHistoryDetails.value);
  const gameDetails = historyStore.historyDetailObj ?? {};
  // 相同gameId不请求
  if (!Reflect.has(gameDetails, userHistoryDetails.value.gameId)) {
    getHistoryDetails();
  } else {
    gameData.value = gameDetails[userHistoryDetails.value.gameId]?.data;
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.team-info + .team-info {
  margin-left: 6px;
}
</style>
