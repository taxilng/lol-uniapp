<template>
  <view class="record-item p-1 relative bg-white shadow-md rounded-lg">
    <!-- <el-icon
      class="record-close !absolute -top-1 -left-1 text-black !w-5 !h-5 z-10 bg-slate-300 rounded hover:opacity-80 cursor-pointer"
      @click="delItem"
    >
    </el-icon> -->
    <view
      class="record-close !absolute -top-1 -left-1 text-black !w-5 !h-5 z-10 rounded hover:opacity-80 cursor-pointer"
      v-if="editStatus"
    >
      <uv-icon name="close-circle-fill" size="24" @click="delItem"></uv-icon>
    </view>

    <view class="absolute top-0 right-0 flex items-center">
      <text class="text-sm"> {{ activeTab.name }}排名 </text>
      <text
        class="ml-2 bg-red-500 text-white w-8 h-8 flex items-center justify-center rounded-tr-lg"
      >
        {{ getRanking(item, index) }}
      </text>
    </view>

    <view class="flex items-center" @click="handleOpenHistory">
      <view class="cursor-pointer avartarBox">
        <view
          v-if="item.currentGame?.gameName || item.curryMap?.gameId"
          class="greenRound"
        ></view>
        <LolAvartar :size="40" :iconId="item.iconId" />
      </view>

      <view class="ml-2">
        <view class="font-medium">
          <text class="text-base text-gray-900 cursor-pointer">{{
            item.name
          }}</text>
          <text class="text-xs ml-2 text-gray-400">
            <template v-if="mode === 'mini'">{{
              item.onlineInfo?.length < 5
                ? item.onlineInfo
                : item.onlineInfo?.length === 19
                ? item.onlineInfo?.slice(5, 16)
                : item.onlineInfo?.split("(")?.[1]?.slice(5, 16)
            }}</template>
            <template v-else>V{{ item.level }}</template>
          </text>
        </view>
        <view v-if="mode === 'mini' && activeTab?.name?.includes('黑')">
          <text class="mt-1 text-xs mr-2"
            >黑胜: {{ item.blackoutWins * 2 - item.blackoutTimes }}</text
          >
          <text class="mt-1 text-xs mr-2"
            >胜率:
            {{
              `${((item.blackoutWins / item.blackoutTimes) * 100).toFixed(2)}%`
            }}</text
          >
          <text class="mt-1 text-xs"
            >开黑C:
            {{
              `${item.blackMvp + item.blackSvp}/${item.blackoutTimes} (${(
                ((item.blackMvp + item.blackSvp) / item.blackoutTimes) *
                100
              ).toFixed(2)}%)`
            }}</text
          >
        </view>
        <view
          class="flex flex-wrap"
          v-if="mode === 'mini' && !activeTab?.name?.includes('黑')"
        >
          <text class="mt-1 text-xs mr-2"
            >胜: {{ item.wins - item.losses }}</text
          >
          <text v-if="batchBaseUrl !== '地址3'" class="mt-1 text-xs mr-2"
            >胜率: {{ `${item.rate}%` }}</text
          >
          <text v-if="batchBaseUrl === '地址3'" class="mt-1 text-xs"
            >总场次: {{ item.totalGames }}</text
          >
          <text v-else class="mt-1 text-xs"
            >总CARRY:
            {{
              `${item.mvp + item.svp}/${item.totalGames} (${(
                ((item.mvp + item.svp) / item.totalGames) *
                100
              ).toFixed(2)}%)`
            }}</text
          >
          <view
            v-if="batchBaseUrl === '地址3'"
            class="flex flex-wrap mt-1 text-xs"
          >
            <view v-if="item.damageMax">
              <i class="mr-1 ml-2 honor16 honor16-hurt2"></i
              >{{ percentageConversion(item.damageMax, 0) }}
            </view>
            <view v-if="item.defenseMax">
              <i class="mr-1 ml-2 honor16 honor16-hurt"></i
              >{{ percentageConversion(item.defenseMax, 0) }}
            </view>
            <view v-if="item.killsMax">
              <i class="mr-1 ml-2 honor16 honor16-kill"></i
              >{{ percentageConversion(item.killsMax, 0) }}
            </view>
            <view v-if="item.assistsMax">
              <i class="mr-1 ml-2 honor16 honor16-attack"></i
              >{{ percentageConversion(item.assistsMax, 0) }}
            </view>
            <view v-if="item.pentaKills">
              <i class="mr-1 ml-2 honor16 honor16-kill5"></i
              >{{ percentageConversion(item.pentaKills, 0) }}
            </view>
          </view>
        </view>
        <view v-if="mode !== 'mini'" class="mt-1 text-xs"
          >在线时间: {{ item.onlineInfo }}</view
        >
      </view>
    </view>

    <view
      class="mt-2 text-sm text-gray-500"
      v-show="['normal', 'detailed'].includes(mode)"
    >
      <view class="mt-2" v-if="batchBaseUrl !== '地址3' && mode === 'detailed'"
        >最近评分：{{ item.message }}</view
      >
      <view class="flex flex-wrap text-sm text-gray-500 gap-2 mt-2">
        <view
          v-for="(info, key) in userInfos"
          :key="key"
          class="flex items-center"
        >
          <text class="whitespace-nowrap">{{ info.label }}:</text>
          <text class="ml-2 text-blue-400"> {{ info.value }}</text>
        </view>
      </view>
      <template v-if="batchBaseUrl === '地址3' && mode === 'detailed'">
        <view class="flex flex-wrap mt-1 text-sm">
          <view v-if="item.damageMax">
            <i class="mr-1 ml-2 honor16 honor16-hurt2"></i
            >{{ percentageConversion(item.damageMax) }}
          </view>
          <view v-if="item.defenseMax">
            <i class="mr-1 ml-2 honor16 honor16-hurt"></i
            >{{ percentageConversion(item.defenseMax) }}
          </view>
          <view v-if="item.killsMax">
            <i class="mr-1 ml-2 honor16 honor16-kill"></i
            >{{ percentageConversion(item.killsMax) }}
          </view>
          <view v-if="item.assistsMax">
            <i class="mr-1 ml-2 honor16 honor16-attack"></i
            >{{ percentageConversion(item.assistsMax) }}
          </view>
          <view v-if="item.pentaKills">
            <i class="mr-1 ml-2 honor16 honor16-kill5"></i
            >{{ percentageConversion(item.pentaKills) }}
          </view>
        </view>
        <view
          v-for="(firend, key) in item.sortHarmfulFriend"
          :key="key"
          class="mt-2"
        >
          <text class="whitespace-nowrap inline-block min-w-24">{{
            firend.label
          }}</text>
          <text class="ml-2 inline-block min-w-10"
            >胜<text class="text-blue-400">{{ firend.netVictoryField }}</text>
          </text>
          <text class="ml-2"
            >场次<text class="text-violet-500">{{
              `${firend.wins}/${firend.totalGames}`
            }}</text></text
          >
        </view>
      </template>

      <!-- <view v-if="mode === 'detailed'" class="message-detail" v-html="item.messageDetail"></view> -->
    </view>
  </view>
</template>

<script setup>
import { ref, toRefs, computed } from "vue";

import LolAvartar from "@/components/LolAvartar.vue";
import { EventBus } from "@/utils/event-bus.js";
import { areaMap } from "@/utils/area.js";
import { navigateToWithLimit } from "@/utils/auth";
import { userHistoryStore } from "@/stores/userHistory";

const props = defineProps({
  item: Object,
  index: Number,
  oldIndex: Number,
  mode: String,
  activeTab: Object,
  list: Array,
  editStatus: Boolean,
});
const emits = defineEmits(["delItem"]);

const { item, mode, activeTab, list, editStatus } = toRefs(props);

const batchBaseUrl = ref(uni.getStorageSync("batchBaseUrl"));

EventBus.on("updateBaseUrl", () => {
  console.log("baseurl地址触发更新哦");
  batchBaseUrl.value = uni.getStorageSync("batchBaseUrl");
});

function percentageConversion(val, decimal = 2) {
  return ((val / item.value.totalGames) * 100).toFixed(decimal);
}

function getRanking(item, index) {
  if (batchBaseUrl.value === "地址3") {
    return (
      list.value?.findIndex(v => v.netVictoryField === item.netVictoryField) + 1
    );
  } else {
    if (activeTab?.value?.name?.includes("黑胜场")) {
      return (
        list.value?.findIndex(
          v =>
            v.blackoutWins * 2 - v.blackoutTimes ===
            item.blackoutWins * 2 - item.blackoutTimes
        ) + 1
      );
    } else if (activeTab?.value?.name?.includes("总胜场")) {
      return (
        list.value?.findIndex(
          v => v.wins - v.losses === item.wins - item.losses
        ) + 1
      );
    } else if (activeTab?.value?.name?.includes("黑胜率")) {
      const idx = list.value?.findIndex(v => {
        if (v.blackoutTimes && item.blackoutTimes) {
          return (
            v.blackoutWins / v.blackoutTimes ===
            item.blackoutWins / item.blackoutTimes
          );
        } else {
          return false;
        }
      });
      if (idx === -1) {
        return "无";
      } else {
        return idx + 1;
      }
    } else if (activeTab?.value?.name?.includes("黑CARRY")) {
      const idx = list.value?.findIndex(v => {
        if (v.blackoutTimes && item.blackoutTimes) {
          return (
            (v.blackMvp + v.blackSvp) / v.blackoutTimes ===
            (item.blackMvp + item.blackSvp) / item.blackoutTimes
          );
        } else {
          return false;
        }
      });
      if (idx === -1) {
        return "无";
      } else {
        return idx + 1;
      }
    } else {
      return index + 1;
    }
  }
}

const userInfos = computed(() =>
  [
    {
      label: "净胜场",
      value: item.value.wins - item.value.losses,
      visible:
        mode.value === "detailed" || !activeTab.value.name?.includes("黑"),
    },
    {
      label: "开黑净胜场",
      value: item.value.blackoutWins * 2 - item.value.blackoutTimes,
      visible:
        (mode.value === "detailed" || activeTab.value.name?.includes("黑")) &&
        !(batchBaseUrl.value === "地址3"),
    },
    {
      label: "胜率",
      value: item.value.rate + "%",
      visible:
        mode.value === "detailed" || !activeTab.value.name?.includes("黑"),
    },
    {
      label: "开黑胜率",
      value:
        ((item.value.blackoutWins / item.value.blackoutTimes) * 100).toFixed(
          2
        ) + "%",
      visible: mode.value === "detailed" && !(batchBaseUrl.value === "地址3"),
    },
    {
      label: "单排胜率",
      value:
        (
          ((item.value.wins - item.value.blackoutWins) /
            (item.value.totalGames - item.value.blackoutTimes)) *
          100
        ).toFixed(2) + "%",
      visible: mode.value === "detailed" && !(batchBaseUrl.value === "地址3"),
    },
    {
      label: "开黑CARRY",
      value:
        item.value.blackMvp +
        item.value.blackSvp +
        " (" +
        (
          ((item.value.blackMvp + item.value.blackSvp) /
            item.value.blackoutTimes) *
          100
        ).toFixed(2) +
        "%)",
      visible:
        (mode.value === "detailed" || activeTab.value.name?.includes("黑")) &&
        !(batchBaseUrl.value === "地址3"),
    },
    {
      label: "总CARRY",
      value:
        item.value.mvp +
        item.value.svp +
        " (" +
        (
          ((item.value.mvp + item.value.svp) / item.value.totalGames) *
          100
        ).toFixed(2) +
        "%)",
      visible:
        (mode.value === "detailed" || !activeTab.value.name?.includes("黑")) &&
        !(batchBaseUrl.value === "地址3"),
    },
    {
      label: "KDA",
      value: `${item.value.avgkills} / ${item.value.avgDeaths} / ${item.value.avgAssists}`,
      visible:
        mode.value === "detailed" || !activeTab.value.name?.includes("黑"),
    },
    // {
    //   label: '击杀',
    //   value: item.value.avgkills,
    //   visible: mode.value === 'detailed'
    // },
    // {
    //   label: '死亡',
    //   value: item.value.avgDeaths,
    //   visible: mode.value === 'detailed'
    // },
    // {
    //   label: '助攻',
    //   value: item.value.avgAssists,
    //   visible: mode.value === 'detailed'
    // },
    {
      label: "评分",
      value: item.value.avgGame_score,
      visible:
        (mode.value === "detailed" || !activeTab.value.name?.includes("黑")) &&
        !(batchBaseUrl.value === "地址3"),
    },
    {
      label: "二黑",
      value: item.value.twoBlackWins + "/" + item.value.twoBlack,
      visible:
        (mode.value === "detailed" || activeTab.value.name?.includes("黑")) &&
        !(batchBaseUrl.value === "地址3"),
    },
    {
      label: "三黑",
      value: item.value.threeBlackWins + "/" + item.value.threeBlack,
      visible:
        (mode.value === "detailed" || activeTab.value.name?.includes("黑")) &&
        !(batchBaseUrl.value === "地址3"),
    },
    {
      label: "四黑",
      value: item.value.fourBlackWins + "/" + item.value.fourBlack,
      visible:
        (mode.value === "detailed" || activeTab.value.name?.includes("黑")) &&
        !(batchBaseUrl.value === "地址3"),
    },
    {
      label: "五黑",
      value: item.value.fiveBlackWins + "/" + item.value.fiveBlack,
      visible:
        (mode.value === "detailed" || activeTab.value.name?.includes("黑")) &&
        !(batchBaseUrl.value === "地址3"),
    },
    {
      label: "开黑场次",
      value: item.value.blackoutTimes,
      visible:
        (mode.value === "detailed" || activeTab.value.name?.includes("黑")) &&
        !(batchBaseUrl.value === "地址3"),
    },
    {
      label: "有效场次",
      value: item.value.totalGames,
      visible:
        ["detailed"].includes(mode.value) ||
        !activeTab.value.name?.includes("黑"),
    },
    {
      label: "神队友",
      value: (() => {
        if (item.value.sortHarmfulFriend?.length) {
          const firend = item.value.sortHarmfulFriend?.[0];
          if (firend.netVictoryField > 0) {
            return `${firend.label} 胜${firend.netVictoryField}`;
          } else {
            return "无";
          }
        } else {
          return "无";
        }
      })(),
      visible:
        ["normal", "detailed"].includes(mode.value) &&
        batchBaseUrl.value === "地址3",
    },
    {
      label: "损友",
      value: (() => {
        if (item.value.sortHarmfulFriend?.length) {
          const firend =
            item.value.sortHarmfulFriend?.[
              item.value.sortHarmfulFriend.length - 1
            ];
          if (firend.netVictoryField < 0) {
            return `${firend.label} 胜${firend.netVictoryField}`;
          } else {
            return "无";
          }
        } else {
          return "无";
        }
      })(),
      visible:
        ["normal", "detailed"].includes(mode.value) &&
        batchBaseUrl.value === "地址3",
    },
    {
      label: "首场时间",
      value: item.value.startTime,
      visible: ["normal", "detailed"].includes(mode.value),
    },
    {
      label: "所属大区",
      value: areaMap[item.value.areaId]?.name,
      visible: mode.value === "detailed",
    },
    {
      label: "战绩隐藏",
      value: item.value.publicInfo,
      visible: mode.value === "detailed",
    },
    {
      label: "全部大乱斗",
      value: `${
        item.value.allChaotic?.wins - item.value.allChaotic?.losses
      }净胜场 / ${item.value.allChaotic?.wins}胜 / ${
        item.value.allChaotic?.losses
      }负 / ${item.value.allChaotic?.rate}胜率`,
      visible: mode.value === "detailed" && !(batchBaseUrl.value === "地址3"),
    },
  ].filter(item => item.visible)
);

const historyStore = userHistoryStore();
function handleOpenHistory() {
  if (!editStatus.value) {
    historyStore.setHistoryList(item.value);
    navigateToWithLimit({
      url: "/pages/history/index",
    });
  }
}

function delItem() {
  emits("delItem", props.oldIndex);
}
</script>

<style lang="scss" scoped>
.message-detail {
  line-height: 32px;

  // :deep(img) {
  //   width: 1rem !important;
  // }
}
.avartarBox {
  position: relative;

  .greenRound {
    position: absolute;
    top: 0rpx;
    right: -1rpx;
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
</style>
