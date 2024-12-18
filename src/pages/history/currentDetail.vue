<template>
  <view
    class="max-w-screen-md mx-auto overflow-y-auto bg-slate-50 h-full flex flex-col"
  >
    <uv-loading-page
      :loading="loading"
      loading-text="加载中..."
      font-size="24rpx"
    ></uv-loading-page>
    <view class="history-details">
      <view class="flex justify-between items-center p-1 bg-blue-100">
        <view class="flex items-center">
          <LolAvartar
            :size="40"
            :iconId="userHistory.iconId ?? userHistory.profileIcon"
          />
          <view>
            <text class="ml-2 text-base">{{
              userHistory.name ?? userHistory.riotIdGameName
            }}</text>
            <view>
              <text class="ml-2 text-sm">{{
                parseTime(userHistoryDetails1.playerCredentials?.gameCreateDate)
              }}</text>
              <text class="ml-2 text-sm">{{
                userHistoryDetails1.competitionType ??
                levelConfig.game_mod[
                  userHistoryDetails1.playerCredentials?.queueId
                ]
              }}</text>
              <text class="ml-2 text-sm">
                已开始{{
                  timePassed(
                    userHistoryDetails1?.playerCredentials?.gameCreateDate
                  )
                }}分钟</text
              >
            </view>
          </view>
        </view>
      </view>

      <view class="mt-2">
        <view
          class="flex pt-2 bg-green-100"
          v-for="(player, playerIndex) in userHistoryDetails1.teamOne"
          :key="playerIndex"
          @click="goSO1HistoryList(player)"
        >
          <view>
            <HeroAvatar :championId="player.championId" :size="32" />
          </view>

          <view class="ml-1">
            <LolAbility :iconId="player.spell1Id" />
            <LolAbility class="mt-1" :iconId="player.spell2Id" />
          </view>

          <view class="ml-1">
            <view class="mt-1 text-sm">
              <text
                class="cursor-pointer"
                :class="{
                  'text-fuchsia-500': player.summonerInternalName?.includes(
                    userHistory.name
                  ),
                }"
                >{{ player.summonerInternalName }}</text
              >
            </view>
          </view>
        </view>
      </view>
      <view class="mt-2">
        <view
          class="flex pt-2 bg-red-100"
          v-for="(player, playerIndex) in userHistoryDetails1.teamTwo"
          :key="playerIndex"
          @click="goSO1HistoryList(player)"
        >
          <view>
            <HeroAvatar :championId="player.championId" :size="32" />
          </view>

          <view class="ml-1">
            <LolAbility :iconId="player.spell1Id" />
            <LolAbility class="mt-1" :iconId="player.spell2Id" />
          </view>

          <view class="ml-1">
            <view class="mt-1 text-sm">
              <text
                class="cursor-pointer"
                :class="{
                  'text-fuchsia-500': player.summonerInternalName?.includes(
                    userHistory.name
                  ),
                }"
                >{{ player.summonerInternalName }}</text
              >
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
import { querySummonerProfile, history_all, spectator_info } from "@/axios/api";
import {
  parseTime,
  timePassed,
  handlerso1Data,
  navigateToWithLimit,
} from "@/utils/auth";
import { levelConfig, platformMap } from "@/utils/area.js";
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

async function goSO1HistoryList(player) {
  try {
    loading.value = true;
    const area = platformMap[userHistory.value?.list?.[0]?.platformId];
    const res1 = await querySummonerProfile({
      area,
      puuid: player.puuid,
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
      puuid: player.puuid,
      beginIdx: 0,
      count: 20,
    });
    const res3 = await spectator_info({
      area,
      puuid: player.puuid,
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

const userHistoryDetails1 = ref({});

onMounted(() => {
  userHistory.value = historyStore.historyList ?? {};
  const userHistoryDetails = historyStore.historyDetail ?? {};
  console.log("出发了吗", userHistoryDetails);
  console.log("userHistory.value", userHistory.value);
  loading.value = false;

  const playerChampionSelections =
    userHistoryDetails.game.playerChampionSelections;
  const teamOne = userHistoryDetails.game.teamOne.map(v => {
    let spell1Id = undefined;
    let spell2Id = undefined;
    const findOne = playerChampionSelections.find(
      x => x.summonerInternalName === v.summonerInternalName
    );
    if (findOne) {
      spell1Id = findOne.spell1Id;
      spell2Id = findOne.spell2Id;
    }
    return { ...v, spell1Id, spell2Id };
  });
  const teamTwo = userHistoryDetails.game.teamTwo.map(v => {
    let spell1Id = undefined;
    let spell2Id = undefined;
    const findOne = playerChampionSelections.find(
      x => x.summonerInternalName === v.summonerInternalName
    );
    if (findOne) {
      spell1Id = findOne.spell1Id;
      spell2Id = findOne.spell2Id;
    }
    return { ...v, spell1Id, spell2Id };
  });
  userHistoryDetails1.value = { ...userHistoryDetails, teamOne, teamTwo };
  console.log("最终只userHistoryDetails1", userHistoryDetails1.value);
});
</script>

<style lang="scss" scoped>
.team-info + .team-info {
  margin-left: 6px;
}
</style>
