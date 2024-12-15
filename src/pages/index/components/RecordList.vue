<template>
  <view>
    <uv-tabs
      v-if="batchBaseUrl !== '地址3'"
      :list="tabs"
      @click="tabChange"
      :current="currentTabs"
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
  editStatus: Boolean,
  mode: String,
});
const { list, editStatus } = toRefs(props);
const currentTabs = ref(0);
const tabs = ref([
  { name: "总胜场", value: "TotalVictoryField", sort: sortField },
  { name: "黑胜场", value: "blackField", sort: sortBlackfield },
  { name: "黑胜率", value: "rate", sort: sortRate },
  { name: "黑CARRY", value: "carry", sort: sortBlackCarry },
]);
const activeTab = ref(tabs.value?.[0]);
function tabChange(item) {
  console.log("item", item);
  currentTabs.value = item.index;
  activeTab.value = tabs.value?.find(t => t.value === item.value);
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

function sortBlackCarry(a, b) {
  if (a.blackoutTimes && b.blackoutTimes) {
    return (
      (a.blackMvp + a.blackSvp) / a.blackoutTimes -
      (b.blackMvp + b.blackSvp) / b.blackoutTimes
    );
  } else {
    return -1;
  }
}

function sortRate(a, b) {
  if (a.blackoutTimes && b.blackoutTimes) {
    return a.blackoutWins / a.blackoutTimes - b.blackoutWins / b.blackoutTimes;
  } else {
    return -1;
  }
}

function sortBlackfield(a, b) {
  return (
    a.blackoutWins * 2 - a.blackoutTimes - b.blackoutWins * 2 + b.blackoutTimes
  );
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
  const result = list.value?.map((item, index) => ({
    ...item,
    oldIndex: index,
  }));
  const targetSort = activeTab.value?.sort;
  return result?.sort(targetSort).reverse();
});

function handleDelItem(index) {
  list.value.splice(index, 1);

  if (uni.getStorageSync("lol")) {
    uni.setStorageSync("lol", JSON.stringify(props.list));
  }
}
</script>

<style lang="scss" scoped></style>
