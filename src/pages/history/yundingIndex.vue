<template>
  <view class="max-w-screen-sm mx-auto h-full overflow-y-auto bg-slate-50">
    <view class="history">
      <view
        @click="updateRecord"
        class="flex items-center relative p-2 bg-slate-100"
      >
        <view>
          <LolAvartar
            :size="40"
            :iconId="recordData.iconId"
            :loading="loading"
          />
        </view>

        <view class="ml-2 flex-1">
          <view class="font-medium">
            <text class="text-base">{{ recordData.nameInfoNew }}</text>
            <text class="text-xs ml-2 text-gray-800"
              >V{{ recordData.level }}</text
            >
          </view>
          <view
            class="message-detail text-xs"
            v-html="renderImg(recordData.messageDetail)"
          ></view>
        </view>
      </view>

      <view
        v-if="recordData?.curryMap?.gameId"
        class="flex justify-center bg-violet-200 w-full p-2 items-center"
        @click="handleOpenCurrentDetailCorn()"
      >
        <view class="mr-4">
          <GameScoreLevel
            :championId="recordData?.curryMap?.championId"
            :size="32"
          />
        </view>
        <view>
          <view class="mb-2">{{ recordData?.curryMap?.titleTime }}</view>
          <view>
            <view class="mr-2 ml-4 greenRound">
              <view v-html="recordData?.curryMap?.title"></view>
            </view>
          </view>
        </view>
      </view>
      <template v-if="recordData.data?.length">
        <view
          class="p-2 m-2 shadow-md rounded-lg overflow-hidden"
          v-for="(item, index) in recordData.data"
          :key="index"
          @click="handleOpenHistoryDetail(item)"
        >
          <view class="flex items-center cursor-pointer">
            <view class="flex flex-col items-center shrink-0">
              <GameScoreLevel :iconId="getScore(item.game_score)" :size="80" />
            </view>
            <view class="text-sm ml-2">
              <view class="flex">
                <view class="text-xs mr-2"
                  >第{{ getRanking(item.ranking) }}</view
                >
                <view class="text-xs">{{
                  levelConfig.yunding_mod[item.game_match_type]
                }}</view>
              </view>
              <view class="mt-1">
                {{ parseTime(`${item.end_time}000`) }}
              </view>
            </view>
          </view>
        </view>
      </template>
      <view v-else class="py-10">
        <uv-empty text="暂无数据" iconSize="100"></uv-empty>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onActivated, onMounted } from "vue";
import LolAvartar from "@/components/LolAvartar.vue";
import GameScoreLevel from "@/components/GameScoreLevel.vue";
import { useRouter } from "vue-router";
import {
  getSign,
  parseTime,
  secondsToHms,
  timePassed,
  navigateToWithLimit,
  getScore,
  getRanking,
  yundingDataProcessing,
  handlerso1Data,
} from "@/utils/auth";
import {
  searchPlayerAll,
} from "@/axios/api";
import { areaMap, levelConfig, platformMap } from "@/utils/area.js";
import screenshot from "@/utils/screenshot";
import { userHistoryStore } from "@/stores/userHistory";
const historyStore = userHistoryStore();

const recordData = ref({});
const router = useRouter();
const shareLoading = ref(false);
console.log(recordData.value);

function handleOpenHistoryDetail(item) {
  historyStore.setHistoryDetail(item);
  navigateToWithLimit({
    url: "/pages/history/yundingDetails",
  });
}

function handleOpenCurrentDetail() {
  console.log("运行22");

  historyStore.setHistoryDetail(recordData.value?.currentGame);
  navigateToWithLimit({
    url: "/pages/history/currentDetail",
  });
}
// 跳转到实时战绩玉米
function handleOpenCurrentDetailCorn() {
  historyStore.setHistoryDetail(recordData.value?.curryMap);
  navigateToWithLimit({
    url: "/pages/history/currentDetailCorn",
  });
}

onMounted(() => {
  const userHistory = historyStore.historyList ?? {};
  recordData.value = { ...userHistory };
  console.log("能触发吗？", userHistory);
});

function renderImg(messageDetail) {
  return messageDetail?.replaceAll(
    '<img style="margin-left:0.3rem;width: 0.36rem;" src="./image/zd.png">',
    ""
  );
}

const loading = ref(false);

function updateRecord() {
  const userHistory = historyStore.historyList ?? {};
  const { name: areaName } = areaMap[userHistory.areaId];
  loading.value = true;
  searchPlayerAll({
    nickname: userHistory.nameInfoNew?.replace("#", "*~*~*"),
    allCount: 30,
    areaId: userHistory.areaId,
    areaName,
    seleMe: 1,
    filter: 1,
    modelId: "2",
    openId: "",
    ...getSign(),
  })
    .then(resp => {
      const res = resp.data;
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
      const newData = yundingDataProcessing(res);
      historyStore.setHistoryList(newData);
      recordData.value = newData;
      console.log("新格式", newData);
      uni.showToast({
        title: "更新战绩成功",
        icon: "success",
      });
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleShare() {
  shareLoading.value = true;
  screenshot(".history", "战绩列表").finally(
    () => (shareLoading.value = false)
  );
}
</script>

<style lang="scss" scoped>
.greenRound {
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 12rpx;
    left: -26rpx;
    width: 16rpx;
    height: 16rpx;
    background-color: #18a058;
    border-radius: 50%;
    animation: indicatorpulse 4s infinite;
  }
}

@keyframes indicatorpulse {
  0% {
    box-shadow: 0 0 #5fbc21;
  }

  20% {
    box-shadow: 0 0 0 10px #0f00;
  }

  to {
    box-shadow: 0 0 #0f00;
  }
}

.message-detail {
  line-height: 24px;

  :deep(img) {
    width: 1rem !important;
  }
}

.share {
  position: absolute;
  right: 12px;
  top: 12px;
  z-index: 10;
}
</style>
