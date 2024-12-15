import { defineStore } from "pinia";
import { ref } from "vue";

export const userHistoryStore = defineStore("userHistory", () => {
  const singleData = ref({});
  const historyList = ref({});
  const historyDetail = ref({});
  const historyDetailObj = ref({});
  const singleYundingData = ref({});

  function setHistoryList(val) {
    historyList.value = val;
  }

  function setHistoryDetail(val) {
    historyDetail.value = val;
  }

  function setHistoryDetailObj(obj) {
    historyDetailObj.value[obj.gameId] = obj.value;
  }

  function setSingleData(val) {
    singleData.value = val;
  }

  function setSingleYundingData(val) {
    singleYundingData.value = val;
  }

  return {
    historyList,
    setHistoryList,
    historyDetail,
    setHistoryDetail,
    singleData,
    setSingleData,
    historyDetailObj,
    setHistoryDetailObj,
    singleYundingData,
    setSingleYundingData,
  };
});
