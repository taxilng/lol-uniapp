<template>
  <view class="max-w-screen-sm mx-auto h-full overflow-y-auto bg-slate-50">
    <view class="history">
      <scroll-view
        class="scroll-container"
        scroll-y
        @scrolltolower="handleScrollToBottom1"
      >
        <view class="flex items-center relative p-2 bg-slate-100">
          <view class="flex flex-col items-center">
            <LolAvartar
              @click="goHistoryList"
              :size="40"
              :iconId="recordData.iconId"
              :loading="loading"
            />
            <uv-icon @click="initUpdateRecord" class="mt-2" name="moments" color="#2979ff" size="28"></uv-icon>
          </view>
          

          <view class="ml-2 flex-1">
            <view class="font-medium flex items-center">
              <uv-tooltip
                class="text-base"
                color="#000"
                size="1rem"
                :text="recordData.nameInfoNew"
                overlay
                direction="bottom"
              ></uv-tooltip>
              <!-- <text class="text-base">{{ recordData.nameInfoNew }}</text> -->
              <text class="text-xs ml-2 text-gray-800">
                V{{ recordData.level }}
              </text>
            </view>
            <view class="text-purple-600 text-xs mt-1">
              {{ rankEloLoading ? "隐藏分" : dataRankEloNum }}
            </view>
            <view class="mt-1 text-xs">
              在线时间: {{ recordData.onlineInfo }}
            </view>
            <view
              class="message-detail text-xs"
              v-html="renderImg(recordData.messageDetail)"
            ></view>
          </view>
          <view class="ml-2 p-2" v-if="recordData.list" @click="initUpdate">
            <uv-icon name="reload" size="20"></uv-icon>
          </view>
        </view>

        <template v-if="recordData.list">
          <scroll-view
            class="scroll-container"
            scroll-y
            @scrolltolower="handleScrollToBottom3"
          >
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
                <view class="mb-2">
                  {{
                    parseTime(
                      recordData?.currentGame?.playerCredentials
                        ?.gameCreateDate,
                      "{m}月{d}日 {h}:{i}"
                    )
                  }}
                </view>
                <view>
                  <text class="mr-2 ml-4 greenRound">
                    {{
                      levelConfig.game_mod[
                        recordData?.currentGame?.playerCredentials?.queueId
                      ] ?? "新模式"
                    }}
                  </text>
                  <text>
                    已开始{{
                      timePassed(
                        recordData?.currentGame?.playerCredentials
                          ?.gameCreateDate
                      )
                    }}分钟
                  </text>
                </view>
              </view>
            </view>
            <view
              class="p-2 m-2 shadow-md rounded-lg overflow-hidden"
              :class="{
                'bg-green-100': item.win === true,
                'bg-red-100': item.win === false,
              }"
              v-for="(item, index) in recordData.list"
              :key="index"
              @click="handleOpenHistoryDetail(item)"
            >
              <view class="flex items-center cursor-pointer">
                <HeroAvatar
                  :championId="item.championId"
                  :size="40"
                  :wasMvp="item.wasMvp"
                  :wasSvp="item.wasSvp"
                />
                <view class="text-sm ml-2 flex-1">
                  <view class="flex justify-between">
                    <text>
                      {{ item.win ? "胜利" : "失败" }}
                      {{ `${item.kills}/${item.deaths}/${item.assists}` }}
                    </text>
                    <text>{{ parseTime(item.gameStartTimestamp) }}</text>
                  </view>
                  <view class="text-xs mt-1 flex justify-between">
                    <view class="flex items-center">
                      <text class="text-slate-500">
                        {{ levelConfig.game_mod[item.queueId] }}
                      </text>
                      <i
                        v-if="item.damageMax"
                        class="ml-2 honor16 honor16-hurt2"
                      ></i>
                      <i
                        v-if="item.defenseMax"
                        class="ml-2 honor16 honor16-hurt"
                      ></i>
                      <i
                        v-if="item.killsMax"
                        class="ml-2 honor16 honor16-kill"
                      ></i>
                      <i
                        v-if="item.assistsMax"
                        class="ml-2 honor16 honor16-attack"
                      ></i>
                      <i
                        v-if="item.pentaKills"
                        class="ml-2 honor16 honor16-kill5"
                      ></i>
                    </view>
                    <text class="ml-2">
                      用时{{ secondsToHms(item.gameDuration) }}
                    </text>
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>
        </template>
        <template v-if="!recordData.data">
          <uv-button
            size="small"
            type="success"
            text="返回首页"
            @click="goHome"
          ></uv-button>
        </template>
        <template v-if="recordData.data">
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
          <view
            class="p-2 m-2 shadow-md rounded-lg overflow-hidden"
            :class="{
              'bg-green-100': item.isWin === 1,
              'bg-red-100': item.isWin === 2,
            }"
            v-for="(item, index) in recordData.effectiveCompetition"
            :key="index"
            @click="handleOpenHistoryDetail(item)"
          >
            <view class="flex items-center cursor-pointer">
              <HeroAvatar
                :championId="item.championId"
                :size="40"
                :wasMvp="item.wasMvp"
                :wasSvp="item.wasSvp"
              />
              <view class="text-sm ml-2">
                <view>{{ item.titleTime }}</view>
                <view class="mt-1">
                  <rich-text
                    :nodes="`${replaceStrings(item.title)}${
                      item.battleTypeStr
                    }`"
                  ></rich-text>
                </view>
              </view>
            </view>
          </view>
        </template>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, onActivated, onMounted, watch } from "vue";
import { throttle } from "lodash";
import LolAvartar from "@/components/LolAvartar.vue";
import HeroAvatar from "@/components/HeroAvatar.vue";
import { useRouter } from "vue-router";
import {
  getSign,
  parseTime,
  secondsToHms,
  timePassed,
  navigateToWithLimit,
} from "@/utils/auth";
import {
  searchPlayerAll,
  getRankEloInfo,
  querySummonerProfile,
  history_all,
  spectator_info,
} from "@/axios/api";
import { areaMap, levelConfig, platformMap } from "@/utils/area.js";
import { dataProcessing, handlerso1Data } from "@/utils/auth.js";
import screenshot from "@/utils/screenshot";
import { EventBus } from "@/utils/event-bus.js";
import { userHistoryStore } from "@/stores/userHistory";
const historyStore = userHistoryStore();

const dataRankEloNum = ref("");

const recordData = ref({});
const router = useRouter();
const shareLoading = ref(false);
// console.log(recordData.value);
watch(
  recordData.value,
  val => {
    console.log("幼稚吗", val);
  },
  {
    immediate: true,
    deep: true,
  }
);


function goHistoryList() {
  const userHistory = historyStore.historyList ?? {};
  const { name: areaName } = areaMap[userHistory.areaId];
  loading.value = true;
  searchPlayerAll({
    nickname: userHistory.nameInfoNew?.replace("#", "*~*~*"),
    allCount: 10,
    areaId: userHistory.areaId,
    areaName,
    openId: userHistory.openId,
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

function goHome() {
  navigateToWithLimit({
    url: "/pages/index/index",
  });
}

// 翻译几黑
function replaceStrings(str) {
  // 定义替换规则数组，按长度从长到短排序避免部分匹配问题
  const replacements = [
    { search: "满载SUV", replace: "五黑" },
    { search: "五子登科", replace: "五黑" },
    { search: "四大天王", replace: "四黑" },
    { search: "面包车", replace: "四黑" },
    { search: "三蹦子", replace: "三黑" },
    { search: "桃园三杰", replace: "三黑" },
    { search: "自行车", replace: "二黑" },
    { search: "双剑合璧", replace: "二黑" },
    { search: "独轮车", replace: "单排" },
    { search: "独闯天涯", replace: "单排" },
    { search: "满堂彩", replace: "五黑之上" },
    { search: "全军出击", replace: "五黑之上" },
  ];

  let result = str;
  // 遍历替换规则进行替换
  replacements.forEach(item => {
    result = result.replace(item.search, item.replace);
  });
  return result;
}

// 滚动到底部
const beginIdx = ref(0);
const handleScrollToBottom3 = throttle(
  () => {
    console.log("滚动到底部");
    beginIdx.value += 20;
    update3();
  },
  1000,
  { leading: true, trailing: false }
);

function initUpdate() {
  beginIdx.value = 0;
  update3(true);
}

const allCount = ref(10);
const handleScrollToBottom1 = throttle(
  () => {
    console.log("滚动到底部");
    allCount.value += 10;
    updateRecord();
  },
  2000,
  { leading: true, trailing: false }
);

function initUpdateRecord() {
  console.log(232);
  
  allCount.value = 10;
  updateRecord();
}

function handleOpenHistoryDetail(item) {
  historyStore.setHistoryDetail(item);
  navigateToWithLimit({
    url: "/pages/history/details",
  });
}

function handleOpenCurrentDetail() {
  // console.log("运行22");

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

// 接口3 列表更新
async function update3(init) {
  if (!recordData.value?.puuid) {
    return;
  }
  const userHistory = historyStore.historyList ?? {};
  try {
    loading.value = true;
    const area = areaMap[userHistory.areaId]?.name;
    const res1 = await querySummonerProfile({
      area,
      puuid: userHistory.puuid,
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
      beginIdx: beginIdx.value,
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
    if (init) {
      recordData.value = {
        ...handlerso1Data({
          baseInfo: data,
          allrequestParams: [],
          list: res2.data?.data,
        }),
        currentGame,
      };
    } else {
      const newData = handlerso1Data({
        baseInfo: data,
        allrequestParams: [],
        list: res2.data?.data,
      });
      recordData.value.list = [...recordData.value.list, ...newData?.list];
    }
  } catch (error) {
    console.log("错误2", error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  const userHistory = historyStore.historyList ?? {};
  recordData.value = { ...userHistory };
  console.log("列表能触发吗？", userHistory);
  if (userHistory.openId) {
    getRankElo(userHistory);
  }
});

function renderImg(messageDetail) {
  return messageDetail
    ?.replaceAll(
      '<img style="margin-left:0.1rem;width: 0.36rem;" src="./image/zd.png">',
      ""
    )
    ?.replaceAll("font-size: 0.36rem;", "");
}

const loading = ref(false);

function updateRecord() {
  const userHistory = historyStore.historyList ?? {};
  const { name: areaName } = areaMap[userHistory.areaId];
  loading.value = true;
  searchPlayerAll({
    nickname: userHistory.nameInfoNew?.replace("#", "*~*~*"),
    allCount: allCount.value,
    areaId: userHistory.areaId,
    areaName,
    seleMe: 1,
    filter: 1,
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
          icon: "error",
        });
        return;
      }
      const newData = dataProcessing(res, null, "unfilteredRestart");
      historyStore.setHistoryList(newData);
      recordData.value = newData;
      // console.log("新格式", newData);
      uni.showToast({
        title: "更新战绩成功",
        icon: "success",
      });
    })
    .finally(() => {
      loading.value = false;
    });
}

const rankEloLoading = ref(false);
async function getRankElo(userHistory) {
  try {
    rankEloLoading.value = true;
    const res = await getRankEloInfo({
      openId: userHistory.openId,
      areaId: userHistory.areaId,
      ...getSign(),
    });
    // console.log("我隐藏分呢", res);
    if (!res?.data) {
      uni.showToast({
        title: "查询数据失败，请重试",
        icon: "error",
      });
      return;
    }
    dataRankEloNum.value = Object.values(res.data?.data).join(" ");
  } catch (error) {
    console.log("错误", error);
  } finally {
    rankEloLoading.value = false;
  }
}

function handleShare() {
  shareLoading.value = true;
  screenshot(".history", "战绩列表").finally(
    () => (shareLoading.value = false)
  );
}
</script>

<style lang="scss" scoped>
.scroll-container {
  background-color: #fff;
  border-radius: 10rpx;
  height: calc(100vh - 10rpx);
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
