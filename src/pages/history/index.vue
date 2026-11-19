<template>
  <view class="max-w-screen-sm mx-auto min-h-screen bg-slate-50">
    <view class="history bg-white">
      <view>
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
          <view>
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
                      <text class="ml-2">
                        <text class="text-sm">攻</text>
                        <!-- <text :class="{ 'text-red-500': item.damageMax }">
                          {{ ((item.damageAll || 0) / 1000).toFixed(1) }}k
                        </text> -->
                        <text class="text-red-400 ml-1">
                          {{ item.damageAllPer }}
                        </text>
                      </text>
                      <text class="ml-2">
                        <text class="text-sm">承</text>
                        <!-- <text :class="{ 'text-cyan-500': item.defenseMax }">
                          {{ ((item.bearingInjuries || 0) / 1000).toFixed(1) }}k
                        </text> -->
                        <text class="text-cyan-400 ml-1">
                          {{ item.bearingInjuriesPer }}
                        </text>
                      </text>
                    </view>
                    <text class="ml-2">
                      用时{{ secondsToHms(item.gameDuration) }}
                    </text>
                  </view>
                  <view
                    v-if="item.augmentIds?.length"
                    class="flex items-center mt-1"
                  >
                    <img
                      v-for="aug in augmentList(item.augmentIds)"
                      :key="aug.id"
                      class="augment-icon mr-1"
                      :src="aug.icon"
                      @error="hideBrokenIcon"
                      @mouseenter.stop="showAugmentTip($event, aug.id)"
                      @mouseleave="hideAugmentTip"
                      @click.stop="showAugmentTip($event, aug.id)"
                    />
                  </view>
                </view>
              </view>
            </view>
          </view>
        </template>
        <template v-if="!recordData.data && !recordData.list">
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
                  <view v-html="replaceStrings(recordData?.curryMap?.title)"></view>
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
      </view>
    </view>
    <view
      v-if="augmentTip.visible"
      class="augment-tip"
      :style="{ left: augmentTip.x + 'px', top: augmentTip.y + 'px' }"
    >
      <view class="augment-tip__name">
        {{ augmentTip.name }}
        <text v-if="augmentTip.rarity" class="augment-tip__rarity">
          {{ augmentTip.rarity }}
        </text>
      </view>
      <view class="augment-tip__desc">
        {{ augmentTip.desc || "暂无说明" }}
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onActivated, onMounted, watch } from "vue";
import { onReachBottom } from "@dcloudio/uni-app";
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
  replaceStrings,
  getBatchBaseUrlName,
} from "@/utils/auth";
import {
  searchPlayerAll,
  getRankEloInfo,
  querySummonerProfile,
  history_all,
  spectator_info,
} from "@/axios/api";
import {
  lesoFetchPlayerFull,
  lesoMatchAnalysis,
} from "@/api/leso";
import { czjFetchPlayerFull, czjMatchPage } from "@/api/czj";
import { getAugment } from "@/utils/augment";
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
    // 地址1、地址2 走 updateRecord；地址3、地址4 走 update3
    if (getBatchBaseUrlName() === "地址3" || getBatchBaseUrlName() === "地址4") {
      beginIdx.value += 20;
      update3();
      return;
    }
    allCount.value += 10;
    updateRecord();
  },
  2000,
  { leading: true, trailing: false }
);

function initUpdateRecord() {
  // 地址3（recordData.list）走 update3，地址1/2（recordData.data）走 updateRecord
  if (recordData.value?.list) {
    beginIdx.value = 0;
    update3(true);
    return;
  }
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

const augmentTip = ref({
  visible: false,
  x: 0,
  y: 0,
  name: "",
  rarity: "",
  desc: "",
});

function augmentList(ids) {
  return (ids || []).map(id => getAugment(id)).filter(aug => aug.icon);
}

function showAugmentTip(e, id) {
  const meta = getAugment(id);
  const point = e?.touches?.[0] ?? e?.changedTouches?.[0] ?? e ?? {};
  const { windowWidth = 375, windowHeight = 667 } = uni.getSystemInfoSync();
  const tipWidth = 260;
  const tipHeight = 120;
  const x = Number(
    point.clientX ?? point.pageX ?? e?.detail?.x ?? windowWidth / 2
  );
  const y = Number(
    point.clientY ?? point.pageY ?? e?.detail?.y ?? windowHeight / 2
  );
  const top =
    y + tipHeight + 16 > windowHeight
      ? Math.max(8, y - tipHeight - 8)
      : y + 16;
  augmentTip.value = {
    visible: true,
    x: Math.max(8, Math.min(x + 12, windowWidth - tipWidth - 8)),
    y: top,
    name: meta.name,
    rarity: meta.rarityText,
    desc: meta.desc,
  };
}

function hideAugmentTip() {
  augmentTip.value.visible = false;
}

function hideBrokenIcon(e) {
  if (e?.target) e.target.style.display = "none";
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
    const baseName = getBatchBaseUrlName();
    if (baseName === "地址3" || baseName === "地址4") {
      // 地址3（搜联盟）/地址4（峡谷查个分）：nameInfoNew（名字#tag）→ resolve → 分页拉战绩
      const isCzj = baseName === "地址4";
      const [gameName, tagLine] = (recordData.value.nameInfoNew ?? "").split("#");
      if (init) {
        const full = isCzj
          ? await czjFetchPlayerFull({ gameName, tagLine, count: 20 })
          : await lesoFetchPlayerFull({ gameName, tagLine, count: 20 });
        recordData.value = {
          ...handlerso1Data({
            baseInfo: full.base,
            allrequestParams: [{ label: gameName, tagLine }],
            list: full.matchHistory,
          }),
          serverId: full.serverId,
        };
      } else {
        // 滚动加载：按页增量拉取（每页 20 场）
        const page = beginIdx.value / 20 + 1;
        const matchList = isCzj
          ? await czjMatchPage({
              region: recordData.value.serverId,
              puuid: recordData.value.puuid,
              page,
              size: 20,
            })
          : (
              await lesoMatchAnalysis({
                serverId: recordData.value.serverId,
                puuid: recordData.value.puuid,
                page,
                size: 20,
                tag: -1,
              })
            )?.matchHistory ?? [];
        const newData = handlerso1Data({
          baseInfo: recordData.value,
          allrequestParams: [{ label: gameName, tagLine }],
          list: matchList,
        });
        recordData.value.list = [...recordData.value.list, ...newData?.list];
      }
      return;
    }
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

// 页面滚动到底部：地址3（recordData.list）走 update3，地址1/2（recordData.data）走 updateRecord
onReachBottom(() => {
  if (loading.value) return;
  if (recordData.value?.list) {
    handleScrollToBottom3();
    return;
  }
  handleScrollToBottom1();
});

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

      // 先取出已缓存的 lolOnline，再根据 openId 更新对应项后保存
      const matchOpenId = newData.openId || userHistory.openId;
      try {
        const lolOnlineRaw = uni.getStorageSync("lolOnline");
        const lolOnlineArr = lolOnlineRaw ? JSON.parse(lolOnlineRaw) : [];
        if (Array.isArray(lolOnlineArr) && matchOpenId) {
          const idx = lolOnlineArr.findIndex(
            v => v.openId === matchOpenId
          );
          if (idx !== -1) {
            lolOnlineArr[idx] = newData;
          } else {
            lolOnlineArr.push(newData);
          }
          uni.setStorageSync("lolOnline", JSON.stringify(lolOnlineArr));
        }
      } catch (error) {
        console.log("更新 lolOnline 缓存失败", error);
      }

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

.augment-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background-color: #424245;
}

.augment-tip {
  position: fixed;
  z-index: 9999;
  width: 260px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(17, 24, 39, 0.95);
  color: #fff;
  font-size: 12px;
  line-height: 1.5;
  pointer-events: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);

  &__name {
    font-size: 13px;
    font-weight: 600;
  }

  &__rarity {
    margin-left: 6px;
    font-size: 11px;
    font-weight: 400;
    color: #fbbf24;
  }

  &__desc {
    margin-top: 4px;
    color: #e5e7eb;
    white-space: pre-wrap;
  }
}
</style>
