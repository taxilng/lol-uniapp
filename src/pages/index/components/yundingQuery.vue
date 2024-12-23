<template>
  <view class="ml-2 lg:ml-auto max-w-screen-xl mx-auto">
    <uv-form
      v-if="collapseVisible"
      labelPosition="left"
      :model="userInfo"
      ref="formRef"
      labelWidth="100"
    >
      <uv-form-item label="召唤师名称" prop="userInfo.nickname" borderBottom>
        <uv-input
          v-model="userInfo.nickname"
          placeholder="请输入名称"
          border="none"
          clearable
        ></uv-input>
      </uv-form-item>
      <uv-form-item
        label="大区"
        prop="userInfo.areaName"
        borderBottom
        @click="openArea"
      >
        <uv-input
          v-model="userInfo.areaName"
          disabled
          disabledColor="#ffffff"
          placeholder="请选择大区"
          border="none"
        >
        </uv-input>
        <template v-slot:right>
          <uv-icon name="arrow-right"></uv-icon>
        </template>
      </uv-form-item>
      <!-- <uv-form-item label="日期" prop="userInfo.dateRange" borderBottom>
        <view @click="showDatePicker">
          <uv-input
            v-model="userInfo.dateRange"
            disabled
            disabledColor="#ffffff"
            placeholder="请选择日期范围"
            border="none"
          >
          </uv-input>
        </view>
        <template v-slot:right>
          <text class="pr-2" @click="clearDate">清空</text>
        </template>
      </uv-form-item> -->
      <uv-form-item label="总局数" prop="userInfo.num" borderBottom>
        <uv-number-box
          :step="1"
          :min="1"
          :max="1000"
          integer
          v-model="userInfo.num"
        ></uv-number-box>
      </uv-form-item>
      <uv-form-item
        label="游戏类型"
        prop="userInfo.competitionType"
        borderBottom
        @click="openType"
      >
        <uv-input
          v-model="userInfo.competitionTypeName"
          disabled
          disabledColor="#ffffff"
          placeholder="请选择游戏模式"
          border="none"
        >
        </uv-input>
        <template v-slot:right>
          <uv-icon name="arrow-right"></uv-icon>
        </template>
      </uv-form-item>
    </uv-form>
    <view class="flex flex-wrap items-center mt-2">
      <view class="mr-4 ml-2">
        <uv-button
          :loading="loading"
          size="small"
          type="primary"
          text="查询"
          @click="submit"
        ></uv-button>
      </view>
      <view class="mr-4">
        <uv-button
          :loading="loading"
          size="small"
          type="primary"
          text="添加到批量查询"
          @click="insert"
        ></uv-button>
      </view>
      <!-- <view>
        <text @click="toggleCollapse">{{
          collapseVisible ? "收起" : "展开"
        }}</text>
      </view> -->
    </view>
    <view class="flex gap-2 flex-wrap shadow-md rounded-lg mb-4 p-3">
      <uv-tags
        type="warning"
        plain
        plainFill
        v-for="tag in searchHistory"
        :key="tag"
        closable
        @click="selectHistory(tag)"
        @close="handleClose(tag)"
        :text="tag?.nickname"
      />
    </view>
    <view class="shot">
      <YundingRecordCard :recordData="recordData" />
    </view>
    <uv-picker
      ref="pickerRef"
      :columns="[areaList]"
      keyName="name"
      @confirm="areaConfirm"
    ></uv-picker>
    <uv-picker
      ref="typePickerRef"
      :columns="[CompetitionTypeOption]"
      keyName="label"
      @confirm="typeConfirm"
    ></uv-picker>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, nextTick, watch } from "vue";
import { searchPlayerAll } from "@/axios/api.js";
import { EventBus } from "@/utils/event-bus.js";
import { areaMap, defaultUser } from "@/utils/area.js";
import {
  getSign,
  addUserList,
  addSelectedUserList,
  yundingDataProcessing,
} from "@/utils/auth";
import YundingRecordCard from "./YundingRecordCard.vue";
import { userHistoryStore } from "@/stores/userHistory";
const historyStore = userHistoryStore();

const areaList = Object.values(areaMap);
const collapseVisible = ref(true);
const activeName = ref("batch");
const loading = ref(false);
const shareLoading = ref(false);

// 大区选择
const pickerRef = ref();
function openArea() {
  pickerRef.value.open();
}

function areaConfirm(e) {
  console.log("大区选择", e);
  userInfo.value.areaId = e.value?.[0]?.id;
  userInfo.value.areaName = e.value?.[0]?.name;
  // dataRange.value = e.range;
  // userInfo.value.dateRange = `${e.range.before}-${e.range.after}`;
}

// 类型选择
const typePickerRef = ref();
function openType() {
  typePickerRef.value.open();
}
function typeConfirm(e) {
  console.log("类型选择", e);
  userInfo.value.competitionType = e.value?.[0]?.value;
  userInfo.value.competitionTypeName = e.value?.[0]?.label;
}

const userInfo = ref({
  role: [1, 2, 3, 4, 5, 13, 14],
  num: 10,
  competitionType: "1",
  competitionTypeName: "全部比赛",
  dateRange: "",
  nickname: "",
  areaId: "4",
  areaName: "诺克萨斯",
});

// 提交
const formRef = ref();
function submit() {
  // 如果有错误，会在catch中返回报错信息数组，校验通过则在then中返回true
  formRef.value
    .validate()
    .then(res => {
      console.log("输出form", userInfo.value);
      getHistoryOne();
    })
    .catch(errors => {
      console.log("校验失败", errors);
      uni.showToast({
        icon: "error",
        title: "校验失败",
      });
    });
}

const recordData = ref({
  totalGames: 0,
  wins: 0,
  losses: 0,
  rate: undefined,
  mvp: 0,
  svp: 0,
  svpRate: 0,
  mvpRate: 0,
  matchNum: 0,
  aramNum: 0,
  rankNum: 0,
  teamNum: 0,
  blackoutTimes: 0,
  twoBlack: 0,
  threeBlack: 0,
  fourBlack: 0,
  fiveBlack: 0,
  blackoutWins: 0,
  twoBlackWins: 0,
  threeBlackWins: 0,
  fourBlackWins: 0,
  fiveBlackWins: 0,
});

const CompetitionTypeOption = ref([
  { value: "1", label: "全部比赛" },
  { value: "2", label: "排位赛" },
  { value: "3", label: "匹配赛" },
  { value: "4", label: "登顶" },
  { value: "5", label: "前三" },
  { value: "6", label: "狂暴" },
  { value: "7", label: "双人" },
]);

const defaultSelectedUser = [1, 2, 3, 4, 5];
const roles = ref([...defaultSelectedUser]);

const searchHistory = ref([]);
const handleClose = tag => {
  searchHistory.value.splice(searchHistory.value.indexOf(tag), 1);
  uni.setStorageSync("searchHistoryLocal", JSON.stringify(searchHistory.value));
};

// 选择历史用户tag
const selectHistory = tag => {
  if (loading.value) return;
  console.log("选择", tag);
  userInfo.value.nickname = tag.nickname;
  userInfo.value.areaId = tag.areaId;
  userInfo.value.areaName = tag.areaName;
  getHistoryOne();
};

const options1 = ref([...defaultUser]);

onMounted(() => {
  const singleYundingData = historyStore.singleYundingData ?? {};
  console.log("singleYundingData", singleYundingData);
  if (singleYundingData.name) {
    recordData.value = singleYundingData;
  } else {
    const YundingRecord = uni.getStorageSync("YundingRecord");
    try {
      if (YundingRecord && JSON.parse(YundingRecord)) {
        recordData.value = JSON.parse(YundingRecord);
        // console.log("哇哈哈", recordData.value);
      }
    } catch (error) {
      console.log("缓存的单人战绩错误", error);
    }
  }

  const searchHistoryLocal = uni.getStorageSync("searchHistoryLocal");
  try {
    if (searchHistoryLocal && Array.isArray(JSON.parse(searchHistoryLocal))) {
      searchHistory.value = JSON.parse(searchHistoryLocal);
    }
  } catch (error) {
    console.log("缓存的历史搜索", error);
  }
});

function addUserOptions() {
  // 批量查询增加额外的召唤师
  const userList = uni.getStorageSync("userList");
  try {
    if (userList && Array.isArray(JSON.parse(userList))) {
      options1.value = [...defaultUser, ...JSON.parse(userList)];
    }
  } catch (error) {
    console.log("添加召唤师报错", error);
  }
}

function addSelectedUser() {
  // 批量查询增加额外的召唤师
  const selectedUserList = uni.getStorageSync("selectedUserList");
  try {
    if (selectedUserList && Array.isArray(JSON.parse(selectedUserList))) {
      roles.value = [...defaultSelectedUser, ...JSON.parse(selectedUserList)];
    }
  } catch (error) {
    console.log("添加默认选中召唤师报错", error);
  }
}

// 是否是批量查询
const isBatch = computed(() => activeName.value === "batch");

function toggleCollapse() {
  collapseVisible.value = !collapseVisible.value;
}

function addZero(num) {
  return parseInt(num) < 10 ? "0" + num : num;
}

function handleShare() {
  shareLoading.value = true;

  nextTick(() => {
    // screenshot(".shot", "战绩列表").finally(() => (shareLoading.value = false));
  });
}

function formatMsToDate(ms) {
  if (ms) {
    const oDate = new Date(ms);
    const oYear = oDate.getFullYear();
    const oMonth = oDate.getMonth() + 1;
    const oDay = oDate.getDate();
    return `${oYear}-${addZero(oMonth)}-${addZero(oDay)}`;
  } else {
    return "";
  }
}

const emit = defineEmits(["updataTableData"]);
function insert() {
  console.log("插入数据", recordData.value);
  if (recordData.value?.name) {
    const flag = options1.value.some(
      item =>
        item.label === recordData.value.name &&
        item.tagLine === recordData.value.tagLine
    );
    if (!flag) {
      addUserList({
        label: recordData.value?.name,
        tagLine: recordData.value?.tagLine,
        areaId: recordData.value?.areaId,
        value: recordData.value?.nameInfoNew,
      });
      addSelectedUserList(recordData.value?.nameInfoNew);
      addUserOptions();
      addSelectedUser();
      EventBus.emit("updateOption");
      uni.showToast({
        title: "添加成功",
        icon: "success",
      });
    }
  }
  const newData = Object.assign({}, recordData.value);
  emit("updataTableData", newData);
}

function divideBy200(num) {
  const base = 200;
  const result = [];

  // 计算有多少个完整的200
  const fullParts = Math.floor(num / base);

  // 将完整的200添加到结果数组中
  for (let i = 0; i < fullParts; i++) {
    result.push(base);
  }

  // 计算剩余的部分
  const remainder = num % base;

  // 如果剩余部分不为0，则将其添加到结果数组中
  if (remainder > 0) {
    result.push(remainder);
  }

  return result;
}

async function getHistoryOne() {
  console.log("大区", userInfo.value.areaId);
  const { name: areaName } = areaMap[userInfo.value.areaId];
  if (!userInfo.value.nickname) {
    uni.showToast({
      title: "请输入召唤师名称",
      icon: "error",
    });
    return;
  }
  if (!userInfo.value.num) {
    uni.showToast({
      title: "请输入总局数",
      icon: "error",
    });
    return;
  }
  const sign = getSign();
  loading.value = true;
  searchPlayerAll({
    nickname: userInfo.value.nickname,
    allCount: userInfo.value.num,
    areaId: userInfo.value.areaId,
    areaName: userInfo.value.areaName,
    filter: userInfo.value.competitionType,
    modelId: "2",
    seleMe: 1,
    openId: "",
    ...sign,
  })
    .then(resp => {
      uni.setStorageSync("searchLogs", JSON.stringify(resp));
      loading.value = false;
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
      recordData.value = yundingDataProcessing(res);
      handleAfterSuccess();
    })
    .catch(error => {
      console.log("错误", error);
      uni.setStorageSync("searchLogs", JSON.stringify(error));
      uni.showToast({
        message: "查询数据失败，请重试",
        type: "error",
      });
      loading.value = false;
    });
}

function handleAfterSuccess() {
  uni.showToast({
    title: "查询数据成功!!",
    icon: "success",
  });
  const flag = searchHistory.value.some(
    v =>
      v.nickname == userInfo.value.nickname &&
      v.areaId === userInfo.value.areaId
  );
  if (!flag) {
    searchHistory.value.push({
      nickname: userInfo.value.nickname,
      areaId: userInfo.value.areaId,
      areaName: userInfo.value.areaName,
    });
    uni.setStorageSync(
      "searchHistoryLocal",
      JSON.stringify(searchHistory.value)
    );
  }
  console.log(recordData, "recordData");
  uni.setStorageSync("YundingRecord", JSON.stringify(recordData.value));
}

function handOtherData(data) {
  console.log("我的data", data, data.battleInfo);
  const nameInfoNew = data.battleInfo.nameInfoNew;
  const mapOneInfoList = data.battleInfo.mapOneInfoList;
  const allChaotic = mapOneInfoList.find(v => v.type === "大乱斗");
  const allMatching = mapOneInfoList.find(v => v.type === "经典对局");
  const Ranking = mapOneInfoList.filter(
    v => v.type !== "经典对局" && v.type !== "大乱斗"
  );
  let rankingTotal = 0;
  let rankingWins = 0;
  Ranking.forEach(rank => {
    rankingTotal += rank.total;
    rankingWins += rank.wins;
  });
  const rankingData = {
    wins: rankingWins,
    total: rankingTotal,
    losses: rankingTotal - rankingWins,
    netWin: rankingWins * 2 - rankingTotal,
    rate: ((rankingWins / rankingTotal) * 100).toFixed(2),
  };
  const pattern1 = /^(.*?)#(\d+)$/;
  const name = nameInfoNew.match(pattern1)[1];
  const tagLine = nameInfoNew.match(pattern1)[2];
  return {
    ...data,
    ...data.battleInfo,
    name,
    tagLine,
    allChaotic,
    allMatching,
    rankingData,
  };
}
</script>
