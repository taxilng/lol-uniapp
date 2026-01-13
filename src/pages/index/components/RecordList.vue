<template>
  <view>
    <uv-tabs
      class="tabc"
      v-if="batchBaseUrl !== '地址3'"
      :list="tabs"
      @click="tabChange"
      :current="currentTabs"
    ></uv-tabs>
    <uv-tabs
      class="tabc"
      v-if="batchBaseUrl === '地址3'"
      :list="tabs3"
      @click="tabChange3"
      :current="currentTabs3"
    ></uv-tabs>
    <view
      class="record-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
    >
      <view
        class="record-title text-lg hidden"
        style="padding: 12px; padding-bottom: 0"
      >
        战绩排行
      </view>
      <RecordItem
        v-for="(item, index) in sortList"
        :key="item.oldIndex"
        :item="item"
        :index="index"
        :oldIndex="item.oldIndex"
        :mode="mode"
        :activeTab="activeTab"
        :list="sortList"
        :editStatus="editStatus"
        :dataRange="dataRange"
        @delItem="handleDelItem"
      />
    </view>
  </view>
</template>

<script setup>
import { ref, computed, toRefs, watch } from "vue";
import { EventBus } from "@/utils/event-bus.js";
import RecordItem from "./RecordItem.vue";

const props = defineProps({
  list: Array,
  listOnline: Array,
  editStatus: Boolean,
  mode: String,
  dataRange: String,
});
const { list, listOnline, editStatus, dataRange } = toRefs(props);
const currentTabs = ref(0);
const tabs = ref([
  { name: "总胜场", value: "TotalVictoryField", sort: sortField },
  { name: "在线时间", value: "onlineTimeOld", sort: sortOnlineTimeOld },
  { name: "总胜率", value: "TotalWinRate", sort: sortTotalWinRateField },
  { name: "总CARRY", value: "allCarry", sort: sortAllCarry },
  { name: "黑胜场", value: "blackField", sort: sortBlackfield },
  // { name: "黑胜率", value: "rate", sort: sortRate },
  { name: "黑CARRY", value: "carry", sort: sortBlackCarry },
]);
const activeTab = ref(tabs.value?.[0]);
function tabChange(item) {
  currentTabs.value = item.index;
  activeTab.value = tabs.value?.find(t => t.value === item.value);
}

const currentTabs3 = ref(0);
const tabs3 = ref([
  { name: "总胜场", value: "TotalVictoryField", sort: sortField },
  { name: "在线时间", value: "onlineTime", sort: sortOnlineTime },
]);
function tabChange3(item) {
  // console.log("item", item);
  currentTabs3.value = item.index;
  activeTab.value = tabs3.value?.find(t => t.value === item.value);
}

const batchBaseUrl = ref(uni.getStorageSync("batchBaseUrl"));
EventBus.on("updateBatchBaseUrl", () => {
  // console.log("baseurl地址触发更新哦");
  batchBaseUrl.value = uni.getStorageSync("batchBaseUrl");
  initTabs();
});
initTabs();

function initTabs() {
  if (batchBaseUrl.value === "地址3") {
    activeTab.value = {
      name: "总胜场",
      value: "TotalVictoryField",
      sort: sortField,
    };
    currentTabs.value = 0;
  }
}
// watch(props, (val) => {
//   console.log('传来的参数啊', val);
// }, {
//   immediate: true,
//   deep: true,
// })

function sortAllCarry(a, b) {
  // console.log("a", a);
  // console.log("b", b);
  if (a.totalGames && b.totalGames) {
    return (a.mvp + a.svp) / a.totalGames - (b.mvp + b.svp) / b.totalGames;
  } else if (!a.totalGames) {
    return -1;
  } else if (!b.totalGames) {
    return 1;
  }
}

function sortBlackCarry(a, b) {
  if (a.blackoutTimes && b.blackoutTimes) {
    return (
      (a.blackMvp + a.blackSvp) / a.blackoutTimes -
      (b.blackMvp + b.blackSvp) / b.blackoutTimes
    );
  } else if (!a.blackoutTimes) {
    return -1;
  } else if (!b.blackoutTimes) {
    return 1;
  }
}

// 总胜率
function sortTotalWinRateField(a, b) {
  return a.rate - b.rate
}
function sortRate(a, b) {
  if (a.blackoutTimes && b.blackoutTimes) {
    return a.blackoutWins / a.blackoutTimes - b.blackoutWins / b.blackoutTimes;
  } else if (!a.blackoutTimes) {
    return -1;
  } else if (!b.blackoutTimes) {
    return 1;
  }
}

function sortBlackfield(a, b) {
  return (
    a.blackoutWins * 2 - a.blackoutTimes - b.blackoutWins * 2 + b.blackoutTimes
  );
}

function sortOnlineTime(a, b) {
  if (a?.currentGame?.gameName) {
    return 1;
  }
  if (b?.currentGame?.gameName) {
    return -1;
  }
  return a.lastGameDate - b.lastGameDate;
}

function extractTimeFromText(text) {
  // 使用正则表达式匹配括号内的内容
  const regex = /\(([^)]+)\)/;
  const match = text?.match(regex);
  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}

function sortOnlineTimeOld(a, b) {
  // console.log("a", a);
  // console.log("b", b);
  if (a?.curryMap || ["在线", "不在游戏中"].includes(a?.onlineInfo)) {
    return 1;
  }
  if (b?.curryMap || ["在线", "不在游戏中"].includes(b?.onlineInfo)) {
    return -1;
  }
  const aTime = extractTimeFromText(a.onlineInfo);
  const bTime = extractTimeFromText(b.onlineInfo);
  if (!aTime) return -1;
  if (!bTime) return 1;
  if (aTime < bTime) {
    return -1;
  } else {
    return 1;
  }
}

// function sortCarry(a, b) {
//   return (a.mvp + a.svp) / a.totalGames > (b.mvp + b.svp) / b.totalGames
// }

function sortField(a, b) {
  return a.wins - a.losses - b.wins + b.losses;
}

// function sortAllChaotic(a, b) {
//   return a.allChaotic.wins - a.allChaotic.losses - b.allChaotic.wins + b.allChaotic.losses
// }

// function sortBlackRate(a, b) {
//   if (!a.blackoutTimes) return false
//   if (!b.blackoutTimes) return true
//   return a.blackoutWins / a.blackoutTimes > b.blackoutWins / b.blackoutTimes
// }

// function sortSingleRate(a, b) {
//   if (!(a.totalGames - a.blackoutTimes)) return false
//   if (!(b.totalGames - b.blackoutTimes)) return true
//   return (
//     (a.wins - a.blackoutWins) / (a.totalGames - a.blackoutTimes) >
//     (b.wins - b.blackoutWins) / (b.totalGames - b.blackoutTimes)
//   )
// }

const sortList = computed(() => {
  const mylist =
    activeTab.value.value === "onlineTimeOld" ? listOnline.value : list.value;

  const result = mylist?.map((item, index) => ({
    ...item,
    oldIndex: index,
  }));
  const targetSort = activeTab.value?.sort;
  // console.log("排序方法", targetSort);
  return result?.sort(targetSort).reverse();
});

function handleDelItem(index) {
  const mylist =
    activeTab.value.value === "onlineTimeOld" ? listOnline.value : list.value;
  mylist.splice(index, 1);

  if (uni.getStorageSync("lol")) {
    uni.setStorageSync("lol", JSON.stringify(props.list));
  }
  if (uni.getStorageSync("lolOnline")) {
    uni.setStorageSync("lolOnline", JSON.stringify(listOnline.value));
  }
}
</script>

<style lang="scss" scoped>
.share {
  .record-list {
    gap: 6px;
    margin-top: 12px;
  }

  .tabc {
    display: none;
  }
}
</style>
