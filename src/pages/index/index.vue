<template>
  <view
    class="max-w-screen-xl mx-auto h-full overflow-y-auto flex justify-between items-center"
  >
    <uv-tabs :list="tabList" @click="changtab" :current="activeTab"></uv-tabs>
    <view class="mr-2" @click="setParams">
      <uv-icon name="setting-fill" size="24"></uv-icon>
    </view>
  </view>
  <view v-if="activeTab === 2" class="ml-2 lg:ml-auto max-w-screen-xl mx-auto">
    <uv-form
      v-if="collapseVisible"
      labelPosition="left"
      :model="userInfo"
      ref="formRef"
      labelWidth="100"
    >
      <uv-form-item
        label="召唤师"
        prop="userInfo.role"
        borderBottom
        @click="openRolePick"
      >
        <uv-input
          v-model="userInfo.names"
          disabled
          disabledColor="#ffffff"
          placeholder="请选择召唤师"
          border="none"
        ></uv-input>
        <template v-slot:right>
          <uv-icon name="arrow-right"></uv-icon>
        </template>
      </uv-form-item>
      <uv-form-item label="日期" prop="userInfo.dateRange" borderBottom>
        <view @click="showDatePicker">
          <uv-input
            v-model="userInfo.dateRange"
            disabled
            disabledColor="#ffffff"
            placeholder="请选择日期范围"
            border="none"
          ></uv-input>
        </view>
        <template v-slot:right>
          <text class="pr-2" @click="clearDate">清空</text>
        </template>
      </uv-form-item>
      <uv-form-item label="总局数" prop="userInfo.num" borderBottom>
        <uv-number-box
          inputWidth="100"
          :showMinus="false"
          :showPlus="false"
          :step="1"
          :min="1"
          :max="1000"
          integer
          v-model="userInfo.num"
        ></uv-number-box>
      </uv-form-item>
      <uv-form-item
        label="游戏模式"
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
        ></uv-input>
        <template v-slot:right>
          <uv-icon name="arrow-right"></uv-icon>
        </template>
      </uv-form-item>
      <uv-form-item
        label="接口地址"
        prop="userInfo.competitionType"
        borderBottom
        @click="openAddress"
      >
        <uv-input
          v-model="userInfo.batchBaseUrl"
          disabled
          disabledColor="#ffffff"
          placeholder="请选择接口"
          border="none"
        ></uv-input>
        <template v-slot:right>
          <uv-icon name="arrow-right"></uv-icon>
        </template>
      </uv-form-item>
      <view class="flex flex-wrap items-center mt-2">
        <view class="mr-4 ml-2">
          <uv-button
            :loading="loading"
            size="small"
            type="primary"
            text="批量查询"
            @click="submit"
          ></uv-button>
        </view>
        <view class="mr-4" v-if="failRequest.length">
          <uv-button
            :loading="loading"
            size="small"
            type="primary"
            :text="`再次查询(${failRequest.length})`"
            @click="getHistorys('history', 'fail')"
          ></uv-button>
        </view>
        <view class="mr-4">
          <uv-button
            :loading="loading"
            size="small"
            type="success"
            text="在线查询"
            @click="onLineSubmit"
          ></uv-button>
        </view>
        <view class="mr-4" v-if="failOnlineData.length">
          <uv-button
            :loading="loading"
            size="small"
            type="success"
            :text="`再次在线(${failOnlineData.length})`"
            @click="() => getHistorys('online', 'fail')"
          ></uv-button>
        </view>
        <view>
          <uv-button
            :loading="loading"
            size="small"
            type="error"
            text="截图"
            @click="handleShare"
          ></uv-button>
        </view>
      </view>
    </uv-form>
    <view class="flex flex-wrap items-center mt-2">
      <view class="mr-4 ml-2">
        <uv-button
          size="small"
          type="success"
          :plain="true"
          :text="modeName"
          @click="openMode"
        ></uv-button>
      </view>
      <view class="mr-4">
        <uv-button
          type="warning"
          :plain="true"
          size="small"
          text="缓存数据"
          @click="save"
        ></uv-button>
      </view>
      <view class="mr-4">
        <uv-button
          type="primary"
          :plain="true"
          size="small"
          :text="editStatus ? '完成编辑' : '编辑'"
          @click="edit"
        ></uv-button>
      </view>
      <view class="mr-4">
        <uv-button
          type="error"
          :plain="true"
          size="small"
          text="清空"
          @click="clear"
        ></uv-button>
      </view>
    </view>
    <view class="shot">
      <view class="mt-2">{{ userInfo.dateRange }}</view>
      <RecordList
        :class="{ share: shareLoading }"
        :mode="mode"
        :list="tableData1"
        :listOnline="tableDataOnline"
        :editStatus="editStatus"
      />
    </view>
    <uv-calendars
      ref="calendarsRef"
      :date="defaultDate"
      mode="range"
      @confirm="dateConfirm"
    />
    <uv-picker
      ref="pickerRef"
      :columns="[DisplayMode]"
      keyName="label"
      @confirm="modeconfirm"
    ></uv-picker>
    <uv-picker
      ref="typePickerRef"
      :columns="[CompetitionTypeOption]"
      keyName="label"
      @confirm="typeConfirm"
    ></uv-picker>
    <uv-picker
      ref="addressPickerRef"
      :columns="[baseUrlList]"
      keyName="name"
      @confirm="addressConfirm"
    ></uv-picker>
  </view>
  <userQuery v-if="activeTab === 0" @updataTableData="updataTableData" />
  <yundingQuery v-if="activeTab === 1" @updataTableData="updataTableData" />
  <multiple-select
    v-model="show"
    :data="options1"
    :default-selected="roles"
    @confirm="confirmRole"
  ></multiple-select>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, nextTick, watch } from "vue";
import { onShow, onLoad } from "@dcloudio/uni-app";
import omit from "lodash/omit";
import {
  searchPlayerAll,
  leagueSummoner,
  history_all,
  spectator_info,
} from "@/axios/api.js";
import {
  areaMap,
  defaultUser,
  tabList,
  DisplayMode,
  baseUrlList,
} from "@/utils/area.js";
import { EventBus } from "@/utils/event-bus.js";
import { useRouter } from "vue-router";
import RecordList from "./components/RecordList.vue";
import userQuery from "./components/userQuery.vue";
import yundingQuery from "./components/yundingQuery.vue";
import {
  getSign,
  handlerso1Data,
  handlerMerge,
  handlerMergeOld,
  navigateToWithLimit,
  dataProcessing,
} from "@/utils/auth";
import multipleSelect from "@/components/multiple-select";
import screenshot from "@/utils/screenshot";

const collapseVisible = ref(true);

const loading = ref(false);
const shareLoading = ref(false);

// 召唤师多选
const show = ref(false);
function openRolePick() {
  show.value = true;
}

function confirmRole(data) {
  userInfo.value.role = data.map(el => el.value);
  uni.setStorageSync("selectedUserList", JSON.stringify(userInfo.value.role));
  addSelectedUser();
  if (data.length > 2) {
    userInfo.value.names = `${data
      .map(el => el.label)
      .filter((v, index) => index < 2)
      .join(", ")} + ${data.length - 2}`;
  } else {
    userInfo.value.names = data.map(el => el.label).join(", ");
  }
}

const activeTab = ref(0);
function changtab(item) {
  console.log("item", item);
  activeTab.value = item.index;
  addUserOptions();
}

const calendarsRef = ref();
function showDatePicker() {
  calendarsRef.value.open();
}
const dataRange = ref({});
function dateConfirm(e) {
  console.log("日期范围", e);
  dataRange.value = e.range;
  userInfo.value.dateRange = `${e.range.before}-${e.range.after}`;
  // userInfo.value.num = calculationSessions();
}
// 清空日期
function clearDate() {
  dataRange.value = {};
  userInfo.value.dateRange = ``;
}

const mode = ref("mini");
const modeName = ref("极简");
function initDisplayMode() {
  mode.value = uni.getStorageSync("displayMode") || "mini";
  modeName.value =
    DisplayMode?.find(v => v.value === mode.value)?.label ?? "极简";
}
// 大区选择
const pickerRef = ref();
function openMode() {
  pickerRef.value.open();
}
function modeconfirm(e) {
  console.log("模式选择", e);
  mode.value = e.value?.[0]?.value;
  modeName.value = e.value?.[0]?.label;
  uni.setStorageSync("displayMode", e.value?.[0]?.value);
}

// 模式选择
const typePickerRef = ref();
function openType() {
  typePickerRef.value.open();
}
function typeConfirm(e) {
  console.log("模式选择", e);
  uni.setStorageSync("batchGameMode", e.value?.[0]?.value);
  userInfo.value.competitionType = e.value?.[0]?.value;
  userInfo.value.competitionTypeName = e.value?.[0]?.label;
  userInfo.value.queueId = e.value?.[0]?.queueId;
}

// 批量查询接口地址
const addressPickerRef = ref();
function openAddress() {
  addressPickerRef.value.open();
}
function addressConfirm(e) {
  console.log("批量查询接口地址", e);
  uni.setStorageSync("batchBaseUrl", e.value?.[0]?.name);
  userInfo.value.batchBaseUrl = e.value?.[0]?.name;
  EventBus.emit("updateBatchBaseUrl");
}

const userInfo = ref({
  names: "",
  role: [1, 2, 3, 4, 5],
  num: 10,
  competitionType: "5",
  competitionTypeName: "大乱斗",
  queueId: 450,
  dateRange: "",
  batchBaseUrl: "地址1",
});

// 单个查询添加到批量查询的数据
function updataTableData(data) {
  console.log("添加的数据哦", data);
  const findIdx = tableData1.value.findIndex(v => data.value === v.value);
  if (findIdx !== -1) {
    tableData1.value[findIdx] = data;
  } else {
    tableData1.value.push(data);
  }
}

// 提交
const formRef = ref();
function submit() {
  // 如果有错误，会在catch中返回报错信息数组，校验通过则在then中返回true
  formRef.value
    .validate()
    .then(res => {
      // console.log("输出form", userInfo.value);
      const batchBaseUrl = uni.getStorageSync("batchBaseUrl");
      // console.log("当前地址", batchBaseUrl);
      if (false && batchBaseUrl === "地址3") {
        getNewHistorys();
      } else {
        getHistorys();
      }
    })
    .catch(errors => {
      console.log("校验失败", errors);
      uni.showToast({
        icon: "error",
        title: "校验失败",
      });
    });
}

function onLineSubmit() {
  // 如果有错误，会在catch中返回报错信息数组，校验通过则在then中返回true
  formRef.value
    .validate()
    .then(res => {
      // console.log("输出form", userInfo.value);
      const batchBaseUrl = uni.getStorageSync("batchBaseUrl");
      // console.log("当前地址", batchBaseUrl);
      if (false && batchBaseUrl === "地址3") {
        getNewOnline();
      } else {
        getHistorys("online");
      }
    })
    .catch(errors => {
      console.log("校验失败", errors);
      uni.showToast({
        icon: "error",
        title: "校验失败",
      });
    });
}

const failOnlineData = ref([]);
async function getNewOnline(requestScope = "all") {
  let allrequestParams = [];
  if (requestScope === "all") {
    allrequestParams = options1.value.filter(v =>
      userInfo.value.role.includes(v.value)
    );
  } else {
    allrequestParams = failOnlineData.value;
  }
  console.log("allrequestParams", allrequestParams);
  const allrequest = allrequestParams.map(async (v, idx) => {
    try {
      const res1 = await leagueSummoner({
        area: areaMap[v.areaId]?.name,
        gameName: v.label,
        tagLine: v.tagLine,
      });
      // console.log('基础信息', res1);
      if (res1.data?.success === false) {
        uni.showToast({
          title: res1.data?.error?.message,
          icon: "error",
        });
        throw new Error(res1.data?.error?.message);
      }
      const data = res1?.data?.data;
      const res3 = await spectator_info({
        area: areaMap[v.areaId]?.name,
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
      return { baseInfo: data, list: [], currentGame };
    } catch (error) {
      console.log("错误2", error);
      throw error;
    }
  });
  let resp = null;
  try {
    loading.value = true;
    resp = await Promise.allSettled(allrequest);
    console.log("查在线相应", resp);

    let allData = resp.map((v, idx) => {
      if (v.status === "fulfilled") {
        return {
          currentGame: v.value.currentGame,
          ...allrequestParams[idx],
          ...handlerso1Data({
            ...v.value,
            allrequestParams: allrequestParams,
            ...allrequestParams[idx],
            dataRange: dataRange.value,
            competitionType: userInfo.value.competitionType,
          }),
          status: v.status,
        };
      } else {
        return { ...v, ...allrequestParams[idx] };
      }
    });
    let newData = allData.filter(v => v.status === "fulfilled");
    failOnlineData.value = allData.filter(v => v.status === "rejected");
    console.log("失败数据", failOnlineData.value);

    newData = handlerMerge(newData);
    newData.forEach(y => {
      const findIdx = tableData1.value.findIndex(v => y.puuid === v.puuid);
      if (findIdx !== -1) {
        tableData1.value[findIdx] = {
          ...tableData1.value[findIdx],
          currentGame: y.currentGame,
          onlineInfo: y.onlineInfo,
          lastGameDate: y.lastGameDate,
        };
      } else {
        tableData1.value.push(y);
      }
    });
    // console.log("中级接口过", newData, tableData1.value);
    const hasSuccess = allData.some(v => v.status === "fulfilled");
    if (hasSuccess) {
      uni.showToast({
        title: "查询成功！！",
        icon: "error",
      });
    } else {
      uni.showToast({
        title: allData.find(v => v.status === "rejected")?.reason?.message,
        icon: "error",
      });
    }
  } catch (error) {
    console.log("有错误", error);
  } finally {
    // console.log("最终结果新", resp);
    loading.value = false;
    // uni.setStorageSync("searchLogs", JSON.stringify(resp));
  }
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

const failHistoryData = ref([]);
async function getNewHistorys(requestScope = "all") {
  let allrequestParams = [];
  if (requestScope === "all") {
    allrequestParams = options1.value.filter(v =>
      userInfo.value.role.includes(v.value)
    );
  } else {
    allrequestParams = failHistoryData.value;
  }
  console.log("allrequestParams", allrequestParams);
  const countList = divideBy200(userInfo.value.num);
  const allrequest = allrequestParams.map(async (v, idx) => {
    try {
      const res1 = await leagueSummoner({
        area: areaMap[v.areaId]?.name,
        gameName: v.label,
        tagLine: v.tagLine,
      });
      if (res1.data?.success === false) {
        uni.showToast({
          title: res1.data?.error?.message,
          icon: "error",
        });
        throw new Error(res1.data?.error?.message);
      }
      const data = res1?.data?.data;
      const accumulatedMatches = [];
      for (let i = 0; i < countList.length; i++) {
        const res2 = await history_all({
          area: areaMap[v.areaId]?.name,
          puuid: data.puuid,
          beginIdx: 200 * i,
          count: countList[i],
          tag: userInfo.value?.queueId,
        });
        if (res2.data.success && res2?.data?.data?.length) {
          accumulatedMatches.push(...res2?.data?.data);
        }
      }
      const res3 = await spectator_info({
        area: areaMap[v.areaId]?.name,
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
      return { baseInfo: data, list: accumulatedMatches, currentGame };
    } catch (error) {
      console.log("错误2", error);
      throw error;
    }
  });
  let resp = null;
  try {
    loading.value = true;
    resp = await Promise.allSettled(allrequest);
    console.log("相应战绩列表", resp);

    let allData = resp.map((v, idx) => {
      if (v.status === "fulfilled") {
        return {
          currentGame: v.value.currentGame,
          ...allrequestParams[idx],
          ...handlerso1Data({
            ...v.value,
            allrequestParams: allrequestParams,
            ...allrequestParams[idx],
            dataRange: dataRange.value,
            competitionType: userInfo.value.competitionType,
          }),
          status: v.status,
        };
      } else {
        return { ...v, ...allrequestParams[idx] };
      }
    });
    let newData = allData.filter(v => v.status === "fulfilled");
    failHistoryData.value = allData.filter(v => v.status === "rejected");
    console.log("失败数据2", failHistoryData.value);
    newData = handlerMerge(newData);
    newData.forEach(y => {
      const findIdx = tableData1.value.findIndex(v => y.puuid === v.puuid);
      if (findIdx !== -1) {
        tableData1.value[findIdx] = y;
      } else {
        tableData1.value.push(y);
      }
    });
    console.log("中级接口过", newData);
    const hasSuccess = allData.some(v => v.status === "fulfilled");
    if (hasSuccess) {
      uni.showToast({
        title: "查询成功！！",
        icon: "error",
      });
    } else {
      uni.showToast({
        title: allData.find(v => v.status === "rejected")?.reason?.message,
        icon: "error",
      });
    }
  } catch (error) {
    console.log("有错误", error);
  } finally {
    // console.log("最终结果新", resp);
    loading.value = false;
    // uni.setStorageSync("searchLogs", JSON.stringify(resp));
  }
}

const tableData1 = ref([]);
const tableDataOnline = ref([]);
const failRequest = ref([]);

const CompetitionTypeOption = ref([
  { value: "1", label: "全部比赛" },
  { value: "2", label: "单双排", queueId: 420 },
  { value: "3", label: "灵活排位", queueId: 440 },
  { value: "4", label: "匹配赛", queueId: 430 },
  { value: "5", label: "大乱斗", queueId: 450 },
  // { value: "6", label: "非人机" },
]);

watch(
  () => userInfo.value,
  val => {
    // console.log("接口地址", val?.batchBaseUrl);
    if (val?.batchBaseUrl !== "地址3") {
      CompetitionTypeOption.value = [
        { value: "1", label: "全部比赛" },
        { value: "2", label: "单双排", queueId: 420 },
        { value: "3", label: "灵活排位", queueId: 440 },
        { value: "4", label: "匹配赛", queueId: 430 },
        { value: "5", label: "大乱斗", queueId: 450 },
      ];
    } else {
      CompetitionTypeOption.value = [
        { value: "1", label: "全部比赛" },
        { value: "2", label: "单双排", queueId: 420 },
        { value: "3", label: "灵活排位", queueId: 440 },
        { value: "4", label: "匹配赛", queueId: 430 },
        { value: "5", label: "大乱斗", queueId: 450 },
        { value: "6", label: "非人机" },
      ];
    }
  },
  { deep: true }
);

const roles = ref([]);

watch(
  tableData1,
  val => {
    // console.log("总数居啊", val);
  },
  { deep: true, immediate: true }
);

const options1 = ref([...defaultUser]);

onMounted(() => {
  const lol = uni.getStorageSync("lol");
  const lolOnline = uni.getStorageSync("lolOnline");
  try {
    if (lol && Array.isArray(JSON.parse(lol))) {
      tableData1.value = JSON.parse(lol);
    }
    if (lolOnline && Array.isArray(JSON.parse(lolOnline))) {
      tableDataOnline.value = JSON.parse(lolOnline);
    }
  } catch (error) {
    console.log("缓存的默认批量战绩错误", error);
  }

  const defaultPage = uni.getStorageSync("defaultPage");
  try {
    if (
      defaultPage !== undefined &&
      defaultPage !== null &&
      defaultPage !== ""
    ) {
      activeTab.value = Number(defaultPage);
    }
  } catch (error) {
    console.log("默认页面", error);
  }
  addSelectedUser();
  initDisplayMode();
  // 初始化日期
  initDate();
  initBatchBaseUrl();
  initBatchGameMode();
});

function initBatchBaseUrl() {
  const url = uni.getStorageSync("batchBaseUrl");
  // console.log("基础url", url, typeof url);

  userInfo.value.batchBaseUrl = url || "地址1";
}

// 从缓存获取 游戏模式
function initBatchGameMode() {
  const GameMode = uni.getStorageSync("batchGameMode");
  // console.log("GameMode", GameMode, typeof GameMode);
  if (GameMode) {
    userInfo.value.competitionType = GameMode;
    const cur = CompetitionTypeOption.value.find(v => v.value === GameMode);
    if (cur) {
      userInfo.value.competitionTypeName = cur.label;
      userInfo.value.queueId = cur.queueId;
    }
  }
}

onShow(() => {
  // console.log("onShow能触发吗");
  addUserOptions();
});
onLoad(options => {
  // console.log("接收到的参数:", options);
  const activeTabStr = options.activeTab;
  if (activeTabStr) {
    setTimeout(() => {
      activeTab.value = Number(activeTabStr);
    }, 500);
  }
});

EventBus.on("updateOption", () => {
  // console.log("触发更新哦");
  addSelectedUser();
  initDisplayMode();
});

const router = useRouter();
function setParams() {
  navigateToWithLimit({
    url: "/pages/settings/index",
  });
}

const defaultDate = ref([]);
function initDate() {
  const day = new Date().getDate();
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  if (day === 1) {
    defaultDate.value = [`${year}-${month}-1`, `${year}-${month}-2`];
  } else {
    defaultDate.value = [`${year}-${month}-1`, `${year}-${month}-${day}`];
  }
  userInfo.value.dateRange = `${defaultDate.value[0]}-${defaultDate.value[1]}`;
  dataRange.value = {
    before: defaultDate.value[0],
    after: defaultDate.value[1],
  };
  // userInfo.value.num = calculationSessions();
}

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
      roles.value = [...JSON.parse(selectedUserList)];
      userInfo.value.role = [...JSON.parse(selectedUserList)];

      // 召唤师默认选中的中文名
      const data = options1.value?.filter(v => roles.value?.includes(v.value));
      // console.log("默认选中那些之啊", data);

      if (data.length > 2) {
        userInfo.value.names = `${data
          .map(el => el.label)
          .filter((v, index) => index < 2)
          .join(", ")} + ${data.length - 2}`;
      } else {
        userInfo.value.names = data.map(el => el.label).join(", ");
      }
    }
  } catch (error) {
    console.log("添加默认选中召唤师报错", error);
  }
}

function toggleCollapse() {
  collapseVisible.value = !collapseVisible.value;
}

function addZero(num) {
  return parseInt(num) < 10 ? "0" + num : num;
}

function handleShare() {
  shareLoading.value = true;

  nextTick(() => {
    screenshot(".shot", "战绩列表").finally(() => (shareLoading.value = false));
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

function save() {
  try {
    const tableDataLocal = tableData1.value?.map(v => {
      const list = v.list?.map(x => omit(x, "participants"));
      return { ...v, list };
    });
    uni.setStorageSync("lol", JSON.stringify(tableDataLocal));
    uni.setStorageSync("lolOnline", JSON.stringify(tableDataOnline.value));
    uni.showToast({
      title: "缓存成功",
      icon: "success",
    });
  } catch (error) {
    console.log("失败原因", error);

    uni.showToast({
      title: "缓存失败",
      icon: "error",
    });
  }
}

function clear() {
  tableData1.value = [];
  tableDataOnline.value = [];
  uni.removeStorageSync("lol");
  uni.removeStorageSync("lolOnline");
}

// 编辑
const editStatus = ref(false);
function edit() {
  if (editStatus.value) {
    editStatus.value = false;
  } else {
    editStatus.value = true;
  }
}

function calculationSessions() {
  if (!dataRange.value || !dataRange.value.before) {
    return 1;
  }
  const timeDifference =
    new Date(dataRange.value?.after).getTime() -
    new Date(dataRange.value?.before).getTime() +
    1000 * 3600 * 24;
  const days = Math.ceil(timeDifference / (1000 * 3600 * 24));
  // console.log("打印days", days);
  if (days === 1) {
    return 20;
  } else if (days < 4) {
    return days * 15;
  } else if (days < 6) {
    return days * 13;
  } else if (days < 20) {
    return days * 10;
  } else if (days < 30) {
    return days * 8;
  } else {
    return 250;
  }
}
/**
 *
 * @param searchType history 搜索10次 还是搜索online 1次查在线
 * @param searchRange = 搜索下拉框all 还是 失败的记录fail
 */
async function getHistorys(searchType = "history", searchRange = "all") {
  const allCount = searchType === "history" ? userInfo.value.num : 10;
  const filter =
    searchType === "history" ? userInfo.value.competitionType : "1";
  // console.log(323, userInfo.value.num, options1.value);
  const sign = getSign();
  loading.value = true;
  let allrequestParams = [];

  // 默认情况搜索下拉框的值，其他情况搜索失败的记录
  if (searchRange === "all") {
    allrequestParams = options1.value.filter(v =>
      userInfo.value.role.includes(v.value)
    );
  } else if (searchType === "history") {
    allrequestParams = failRequest.value;
  } else if (searchType === "online") {
    allrequestParams = failOnlineData.value;
  }
  const allrequest = allrequestParams.map((v, idx) =>
    searchPlayerAll({
      nickname: `${v.label}*~*~*${v.tagLine}`,
      allCount,
      areaId: v.areaId,
      areaName: areaMap[v.areaId]?.name,
      seleMe: 1,
      filter,
      openId: "",
      ...sign,
    }).then(res => ({ ...res.data, idx }))
  );
  let resp = [];
  const failResp = [];
  try {
    for await (const result of allrequest) {
      // console.log("打印接口result", result);
      if (result.battleInfo) {
        resp.push(result);
        let newData = resp.map(x => {
          return {
            ...dataProcessing(x, dataRange.value),
            ...allrequestParams[x.idx],
          };
        });
        // console.log("我来试试", newData);
        newData = handlerMergeOld(newData);
        const myTableData =
          searchType === "history" ? tableData1.value : tableDataOnline.value;
        newData.forEach(y => {
          const findIdx = myTableData.findIndex(
            v => y.nameInfoNew === v.nameInfoNew
          );
          if (findIdx !== -1) {
            myTableData[findIdx] = y;
          } else {
            myTableData.push(y);
          }
        });
      } else {
        failResp.push(allrequestParams[result.idx]);
      }

      if (searchType === "history") {
        failRequest.value = [...failResp];
        console.log("失败1", failRequest.value);
      } else if (searchType === "online") {
        // 搜索失败的记录
        failOnlineData.value = [...failResp];
        console.log("失败2", failOnlineData.value);
      }
      // results.push(result);
      // renderResults(results); // 每次有新结果就更新UI
    }
    const failNumber =
      searchType === "history"
        ? failRequest.value?.length
        : failOnlineData.value?.length;
    const successNumber = allrequestParams?.length - failNumber;
    uni.showToast({
      title: `成功${successNumber}，失败${failNumber}`,
      icon: "error",
    });
    loading.value = false;
  } catch (error) {
    failResp.push(allrequestParams[result.idx]);
    if (searchType === "history") {
      failRequest.value = [...failResp];
      console.log("失败3", failRequest.value);
    } else if (searchType === "online") {
      // 搜索失败的记录
      failOnlineData.value = [...failResp];
      console.log("失败4", failOnlineData.value);
    }
    console.log("错误", error);
    uni.showToast({
      title: "查询数据失败，请重试",
      icon: "error",
    });
    loading.value = false;
  } finally {
    console.log("最终结果", resp);
    uni.setStorageSync("searchLogs", JSON.stringify(resp));
  }
}

function getAllFailHistorys() {
  const batchBaseUrl = uni.getStorageSync("batchBaseUrl");
  console.log("当前地址", batchBaseUrl);
  if (false && batchBaseUrl === "地址3") {
    getNewHistorys("fail");
  } else {
    failHistorys();
  }
}
</script>
