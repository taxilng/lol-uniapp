<template>
  <view>
    <view class="max-w-7xl mx-auto p-3 sm:p-6 bg-white shadow-md rounded-lg">
      <view class="flex flex-col sm:flex-row items-center sm:items-start">
        <!-- 用户头像和姓名 -->
        <view
          v-if="recordData.name"
          class="flex flex-col items-center justify-center mb-4 cursor-pointer"
          @click="handleOpenHistory"
        >
          <view class="relative">
            <LolAvartar :size="60" :iconId="recordData.iconId" />
            <view class="tooltips" v-if="!showTips">
              <view class="tooltipsText">点击头像查看历史战绩</view>
              <view class="tooltipsArrow"> </view>
            </view>
          </view>
          <h2 class="text-2xl font-semibold text-gray-800">
            {{ recordData.nameInfoNew }}
          </h2>
          <view class="mt-2">
            <text class="text-purple-600">{{
              loading ? "隐藏分" : dataRankEloNum
            }}</text>
          </view>
        </view>
        <!-- 用户信息 -->
        <view class="flex-1">
          <view class="flex flex-wrap gap-4">
            <template v-for="(item, index) in descriptionItems" :key="index">
              <view
                v-if="item.value"
                :key="index"
                class="flex items-center mb-2 text-sm"
              >
                <view class="font-medium text-gray-600 whitespace-nowrap"
                  >{{ item.label }}:</view
                >
                <view
                  class="text-blue-500 ml-2"
                  v-html="
                    typeof item.value == 'number'
                      ? String(item.value)
                      : item.value
                  "
                ></view>
              </view>
            </template>
          </view>
        </view>
        <view
          v-if="recordData?.currentGame?.gameName"
          class="flex justify-center bg-violet-200 w-full p-2 items-center"
          @click="handleOpenCurrentDetail()"
        >
          <view class="mr-4">
            <HeroAvatar
              :championId="recordData?.currentGame?.championId"
              :size="32"
            />
          </view>
          <view>
            <view class="mb-2">{{
              parseTime(
                recordData?.currentGame?.playerCredentials?.gameCreateDate,
                "{m}月{d}日 {h}:{i}"
              )
            }}</view>
            <view>
              <text class="mr-2 ml-4 greenRound">
                {{
                  levelConfig.game_mod[
                    recordData?.currentGame?.playerCredentials?.queueId
                  ]
                }}
              </text>
              <text>
                已开始{{
                  timePassed(
                    recordData?.currentGame?.playerCredentials?.gameCreateDate
                  )
                }}分钟
              </text>
            </view>
          </view>
        </view>
        <view
          v-if="recordData?.curryMap?.gameId"
          class="flex justify-center bg-violet-200 w-full p-2 items-center"
          @click="handleOpenCurrentDetailCorn()"
        >
          <view class="mr-4">
            <HeroAvatar
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
      </view>
    </view>

    <view class="max-w-7xl mx-auto mt-4 bg-white shadow-md rounded-lg">
      <view
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-3 sm:p-6"
      >
        <view class="flex" v-for="(item, index) in battleTypes" :key="index">
          <template v-if="item.rate">
            <view class="w-20 text-sm">
              <view>{{ item.title }}</view>
              <view class="text-blue-500 mt-1">{{ item.totalText }}</view>
            </view>
            <view class="flex-1 ml-1">
              <view class="mb-2">
                <text
                  v-for="(text, textIndex) in item.additionalText"
                  :key="textIndex"
                  class="ml-2 text-xs"
                >
                  {{ text }}
                </text>
              </view>
              <uv-line-progress
                :percentage="item.rate"
                :activeColor="colorRender(item.rate)"
              ></uv-line-progress>
            </view>
          </template>
        </view>
      </view>

      <view class="w-full bg-gray-400 text-center text-white text-sm p-1"
        >排位</view
      >
      <!-- 颜色展示 -->
      <!-- <view class="flex p-2">
        <view class="flex items-center mr-2" v-for="(item, index) in ranks" :key="index">
          <view class="w-4 h-4 mr-2" :style="{ background: item.color }"></view>
          {{ item.name }}
        </view>
      </view> -->

      <view class="grid py-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <template
          v-for="(item, index) in recordData?.battleInfo?.mapOneInfoList"
          :key="index"
        >
          <view
            class="flex items-center p-2 mx-3 flex-wrap bg-gray-50 text-sm"
            v-if="item.total > 1"
            :key="index"
          >
            <view class="flex items-center w-full">
              <img
                class="w-6 h-6 rounded-lg"
                :src="`/image/${item.tier?.slice(0, 2)}.png`"
                alt=""
              />
              <text class="ml-2"> {{ item.type }} </text>
              <text
                class="ml-2 text-white px-1 rounded"
                :style="{ background: getRanks(item.tier) }"
                >{{ item.tier }}</text
              >
            </view>

            <view class="mt-1">
              <text>
                总场次
                <text class="text-blue-500">{{ item.total }}</text>
                场
              </text>

              <text class="mr-3" v-if="item.winPoint !== undefined">
                胜点
                <text class="text-blue-500">{{ item.winPoint }}</text>
              </text>
              <text>
                第一名率
                <text class="text-blue-500">{{ item.top1Rate }}</text>
                %
              </text>
              <!-- <text>
                前三率
                <text class="text-blue-500">{{ item.topThreeRate }}</text>
                %
              </text> -->
            </view>
          </view>
        </template>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, toRefs, watch } from "vue";
import { useRouter } from "vue-router";
import LolAvartar from "@/components/LolAvartar.vue";
import { getRankEloInfo } from "@/axios/api.js";
import { levelConfig } from "@/utils/area.js";
import {
  getSign,
  parseTime,
  timePassed,
  navigateToWithLimit,
} from "@/utils/auth";
import { userHistoryStore } from "@/stores/userHistory";
import HeroAvatar from "@/components/HeroAvatar.vue";
const showTips = ref(uni.getStorageSync("showTips"));
const props = defineProps({
  recordData: Object,
});
const { recordData } = toRefs(props);

const dataRankEloNum = ref("");
const loading = ref(false);

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

// 进度条颜色
function colorRender(rate) {
  if (rate < 48) {
    return "red";
  } else if (rate < 50) {
    return "orange";
  } else if (rate < 52) {
    return "#1f71b7";
  } else {
    return "green";
  }
}

const getRanks = tier => {
  return ranks.find(item => item.name === tier?.slice(0, 2))?.color;
};

const descriptionItems = computed(() => [
  { label: "等级", value: recordData.value.level },
  {
    label: "最高段位",
    value: recordData.value.battleInfo?.seasonInfoMap?.maxTier
      ? `${recordData.value.battleInfo?.seasonInfoMap?.maxTier}${recordData.value.battleInfo?.seasonInfoMap?.maxQueue}`
      : "",
  },
  { label: "综合评价", value: recordData.value.message },
  { label: "总局数", value: recordData.value.totalGames },
  { label: "赢", value: recordData.value.wins },
  { label: "输", value: recordData.value.losses },
  {
    label: "胜率",
    value:
      recordData.value.rate !== undefined ? `${recordData.value.rate}%` : "",
  },
  { label: "MVP", value: recordData.value.mvp },
  { label: "SVP", value: recordData.value.svp },
  { label: "开黑次数", value: recordData.value.blackoutTimes },
  { label: "首场时间", value: recordData.value.startTime },
  { label: "末场时间", value: recordData.value.endTime },
  {
    label: "开黑胜率",
    value: recordData.value.blackoutTimes
      ? `${(
          (recordData.value.blackoutWins / recordData.value.blackoutTimes) *
          100
        ).toFixed(2)}%`
      : "",
  },
  {
    label: "二黑",
    value: recordData.value.twoBlack
      ? `${recordData.value.twoBlackWins}/${recordData.value.twoBlack} (${(
          (recordData.value.twoBlackWins / recordData.value.twoBlack) *
          100
        ).toFixed(0)}%)`
      : "",
  },
  {
    label: "三黑",
    value: recordData.value.threeBlack
      ? `${recordData.value.threeBlackWins}/${recordData.value.threeBlack} (${(
          (recordData.value.threeBlackWins / recordData.value.threeBlack) *
          100
        ).toFixed(0)}%)`
      : "",
  },
  {
    label: "四黑",
    value: recordData.value.fourBlack
      ? `${recordData.value.fourBlackWins}/${recordData.value.fourBlack} (${(
          (recordData.value.fourBlackWins / recordData.value.fourBlack) *
          100
        ).toFixed(0)}%)`
      : "",
  },
  {
    label: "五黑",
    value: recordData.value.fiveBlack
      ? `${recordData.value.fiveBlackWins}/${recordData.value.fiveBlack} (${(
          (recordData.value.fiveBlackWins / recordData.value.fiveBlack) *
          100
        ).toFixed(0)}%)`
      : "",
  },
  // {
  //   label: '全部大乱斗',
  //   value: recordData.value.allChaotic
  //     ? `${recordData.value.allChaotic.wins - recordData.value.allChaotic.losses}净胜场 / ${recordData.value.allChaotic.wins} 胜 / ${recordData.value.allChaotic.losses} 负 / ${recordData.value.allChaotic.rate} 胜率`
  //     : 'N/A'
  // }
]);

const battleTypes = computed(() => [
  {
    title: "总局数",
    totalText: `${recordData.value?.battleInfo?.seasonInfoMap?.totalGames}场`,
    rate: Number(
      recordData.value?.battleInfo?.seasonInfoMap?.totalRate?.replace("%", "")
    ),
    additionalText: [
      `胜${recordData.value.battleInfo?.seasonInfoMap?.totalRate}`,
    ],
  },
  {
    title: "匹配赛",
    totalText: `${recordData.value.allMatching?.total}场`,
    rate: recordData.value.allMatching?.rate,
    status: "exception",
    additionalText: [
      `净胜场${
        recordData.value.allMatching?.wins -
        recordData.value.allMatching?.losses
      }`,
      `胜率${recordData.value.allMatching?.rate}%`,
    ],
  },
  {
    title: "大乱斗",
    totalText: `${recordData.value.allChaotic?.total}场`,
    rate: recordData.value.allChaotic?.rate,
    status: "warning",
    additionalText: [
      `净胜场${
        recordData.value.allChaotic?.wins - recordData.value.allChaotic?.losses
      }`,
      `胜率${recordData.value.allChaotic?.rate}%`,
    ],
  },
  {
    title: "排位",
    totalText: `${recordData.value.rankingData?.total}场`,
    rate: recordData.value.rankingData?.rate,
    status: "warning",
    additionalText: [
      `净胜场${recordData.value.rankingData?.netWin}`,
      `胜率${recordData.value.rankingData?.rate}%`,
    ],
  },
]);

const router = useRouter();

const historyStore = userHistoryStore();
function handleOpenHistory() {
  uni.setStorageSync("showTips", 1);
  showTips.value = 1;
  historyStore.setHistoryList(recordData.value);
  navigateToWithLimit({
    url: "/pages/history/yundingIndex",
  });
}

// 跳转到实时战绩
function handleOpenCurrentDetail() {
  console.log("运行22");
  historyStore.setHistoryList(recordData.value);
  historyStore.setHistoryDetail(recordData.value?.currentGame);
  navigateToWithLimit({
    url: "/pages/history/currentDetail",
  });
}
// 跳转到实时战绩玉米
function handleOpenCurrentDetailCorn() {
  historyStore.setHistoryList(recordData.value);
  historyStore.setHistoryDetail(recordData.value?.curryMap);
  navigateToWithLimit({
    url: "/pages/history/currentDetailCorn",
  });
}
</script>
<style lang="scss" scoped>
:deep(.uv-line-progress-bar__innerText) {
  font-weight: 600;
}
:deep(.uv-line-progress-bar__outer) {
  border-radius: 0 !important;
  background: #8ed3de;
}
:deep(.uv-line-progress-bar__inner) {
  border-radius: 0 !important;
  background: linear-gradient(
    to right,
    rgba(0, 141, 173, 1),
    rgba(0, 225, 162, 1)
  );
}

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

.tooltips {
  opacity: 1;
  position: absolute;
  top: 0px;
  z-index: 10071;
  left: -50px;
  margin-top: -44px;
  transition: opacity 0.3s ease-out, -webkit-transform ease-out,
    transform ease-out;
  transform-origin: 50% 50%;
  display: flex;
  justify-content: center;

  .tooltipsText {
    background-color: #060607;
    border-radius: 5px;
    padding: 11px 13px;
    font-size: 13px;
    color: #fff;
    width: max-content;
  }

  .tooltipsArrow {
    position: absolute;
    background-color: #060607;
    width: 14px;
    height: 14px;
    bottom: -4px;
    transform: rotate(45deg);
    border-radius: 2px;
    z-index: -1;
  }
}
</style>
