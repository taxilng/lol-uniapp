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
            style="width: 180px"
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
            @click="getAllFailHistorys"
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
            @click="getAllFailOnline"
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
        :dataRange="dataRange"
        :listOnline="tableDataOnline"
        :editStatus="editStatus"
        @activeTabChange="onRecordTabChange"
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
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { onShow, onLoad } from "@dcloudio/uni-app";
import pick from "lodash/pick";
import { searchPlayerAll } from "@/axios/api.js";
import {
  areaMap,
  defaultUser,
  tabList,
  DisplayMode,
} from "@/utils/area.js";
import { EventBus } from "@/utils/event-bus.js";
import { useRouter } from "vue-router";
import RecordList from "./components/RecordList.vue";
import userQuery from "./components/userQuery.vue";
import yundingQuery from "./components/yundingQuery.vue";
import {
  getSign,
  getBatchBaseUrlName,
  handlerso1Data,
  handlerMerge,
  handlerMergeOld,
  navigateToWithLimit,
  dataProcessing,
} from "@/utils/auth";
import { lesoFetchPlayerFull } from "@/api/leso";
import { czjFetchPlayerFull } from "@/api/czj";
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

// 接口地址统一走设置页，batchBaseUrl 仅用于本页展示与监听
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
      const batchBaseUrl = getBatchBaseUrlName();
      // console.log("当前地址", batchBaseUrl);
      if (batchBaseUrl === "地址3" || batchBaseUrl === "地址4") {
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
      const batchBaseUrl = getBatchBaseUrlName();
      // console.log("当前地址", batchBaseUrl);
      if (batchBaseUrl === "地址3" || batchBaseUrl === "地址4") {
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
// 同一玩家判定：只能按 nameInfoNew（游戏名#tag，改版后全局唯一，兼容地址1~4）去重
// 不能用 openId：同一账号登录不同大区时 openId 相同，会把不同大区的玩家错误合并
function isSamePlayer(a, b) {
  return !!a?.nameInfoNew && a.nameInfoNew === b?.nameInfoNew;
}

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
      // 地址3（搜联盟）/地址4（峡谷查个分）链路：无实时对局接口，currentGame 为空
      const full =
        getBatchBaseUrlName() === "地址4"
          ? await czjFetchPlayerFull({
              gameName: v.label,
              tagLine: v.tagLine,
            })
          : await lesoFetchPlayerFull({
              gameName: v.label,
              tagLine: v.tagLine,
            });
      const baseInfo = full.base;
      baseInfo.puuid = full.puuid;
      baseInfo.serverId = full.serverId;
      // 在线查询也带上战绩列表，否则单独点"在线查询"后跳历史页列表为空
      return {
        baseInfo,
        list: full.matchHistory,
        currentGame: {},
        statistics: full.statistics,
      };
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
          // 搜联盟链路记录 serverId，历史页刷新/滚动加载需要
          serverId: v.value?.baseInfo?.serverId,
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
      const findIdx = tableData1.value.findIndex(v => isSamePlayer(y, v));
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
  }
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
  const allrequest = allrequestParams.map(async v => {
    try {
      // 地址3（搜联盟）/地址4（峡谷查个分）链路：解析召唤师后分页拉战绩
      const full =
        getBatchBaseUrlName() === "地址4"
          ? await czjFetchPlayerFull({
              gameName: v.label,
              tagLine: v.tagLine,
              count: userInfo.value.num,
            })
          : await lesoFetchPlayerFull({
              gameName: v.label,
              tagLine: v.tagLine,
              count: userInfo.value.num,
            });
      const baseInfo = full.base;
      baseInfo.puuid = full.puuid;
      baseInfo.serverId = full.serverId;
      return {
        baseInfo,
        list: full.matchHistory,
        currentGame: {},
        statistics: full.statistics,
      };
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
          // 搜联盟链路记录 serverId，历史页刷新/滚动加载需要
          serverId: v.value?.baseInfo?.serverId,
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
      const findIdx = tableData1.value.findIndex(v => isSamePlayer(y, v));
      if (findIdx !== -1) {
        tableData1.value[findIdx] = y;
      } else {
        tableData1.value.push(y);
      }
    });
    console.log("中级接口过", newData);
    const hasSuccess = allData.some(v => v.status === "fulfilled");
    if (hasSuccess) {
      // 查询有成功返回数据时，自动静默缓存一次
      try {
        saveData();
      } catch (saveError) {
        console.log("自动缓存失败", saveError);
      }
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
    if (val?.batchBaseUrl !== "地址3" && val?.batchBaseUrl !== "地址4") {
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

// 从缓存读取战绩列表，每次显示页面都会刷新（如从 history 页 updateRecord 更新后回到本页）
function refreshCacheData() {
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
}

onMounted(() => {
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
  refreshCacheData();
  addSelectedUser();
  initDisplayMode();
  // 初始化日期
  initDate();
  initBatchBaseUrl();
  initBatchGameMode();
});

// 接口地址统一走设置页，batchBaseUrl 实时取设置页的 baseUrl 下标
function initBatchBaseUrl() {
  userInfo.value.batchBaseUrl = getBatchBaseUrlName();
}

// 设置页切换接口地址后同步（RecordList/RecordItem 监听 updateBatchBaseUrl 刷新）
EventBus.on("updateBaseUrl", () => {
  initBatchBaseUrl();
  EventBus.emit("updateBatchBaseUrl");
});

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
  // 每次显示都刷新缓存战绩，保证从 history 页 updateRecord 更新后回到本页自动同步
  refreshCacheData();
  addUserOptions();
  // 页面重新可见后让 RecordList 重挂载 tabs，重新测量滑块位置（避免在后台时量出 0 宽度导致滑块停在最左边）
  EventBus.emit("resizeTabs");
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

// 缓存到 localStorage 时只保留 details.vue 详情页需要的参与者字段（全量 participants 过大）
const PARTICIPANT_CACHE_FIELDS = [
  "win",
  "championId",
  "spell1Id",
  "spell2Id",
  "item0",
  "item1",
  "item2",
  "item3",
  "item4",
  "item5",
  "item6",
  "riotIdGameName",
  "riotIdTagline",
  "kills",
  "deaths",
  "assists",
  "pentaKills",
  "perks1",
  "perks2",
  "damageMax",
  "defenseMax",
  "killsMax",
  "assistsMax",
  "damageAll",
  "bearingInjuries",
];

// 静默写入本地缓存（查询成功后自动调用，无提示）
function saveData() {
  const tableDataLocal = tableData1.value?.map(v => {
    const list = v.list?.map(x => ({
      ...x,
      participants: x.participants?.map(p =>
        pick(p, PARTICIPANT_CACHE_FIELDS)
      ),
    }));
    return { ...v, list };
  });
  uni.setStorageSync("lol", JSON.stringify(tableDataLocal));
  uni.setStorageSync("lolOnline", JSON.stringify(tableDataOnline.value));
}

function save() {
  try {
    saveData();
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
  // 根据 RecordList 当前排序 tab 清空：在线时间清 lolOnline，其他清 lol
  if (recordSortTab.value === "onlineTimeOld") {
    tableDataOnline.value = [];
    uni.removeStorageSync("lolOnline");
  } else {
    tableData1.value = [];
    uni.removeStorageSync("lol");
  }
}

// RecordList 内部排序 tab（总胜场/在线时间等），决定当前展示的是哪份数据
const recordSortTab = ref("TotalVictoryField");
function onRecordTabChange(tabValue) {
  recordSortTab.value = tabValue;
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
  const dataRangeFilter = searchType === "history" ? dataRange.value : {};
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
            ...dataProcessing(x, dataRangeFilter),
            ...allrequestParams[x.idx],
          };
        });
        // console.log("我来试试", newData);
        newData = handlerMergeOld(newData);
        const myTableData =
          searchType === "history" ? tableData1.value : tableDataOnline.value;
        newData.forEach(y => {
          const findIdx = myTableData.findIndex(v => isSamePlayer(y, v));
          if (findIdx !== -1) {
            myTableData[findIdx] = y;
            // 清理历史遗留的重复记录（旧链路按不同键写入导致的同名多条）
            for (let i = myTableData.length - 1; i > findIdx; i--) {
              if (isSamePlayer(y, myTableData[i])) {
                myTableData.splice(i, 1);
              }
            }
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
    // 查询有成功返回数据时，自动静默缓存一次
    if (successNumber > 0) {
      try {
        saveData();
      } catch (saveError) {
        console.log("自动缓存失败", saveError);
      }
    }
    uni.showToast({
      title: `成功${successNumber}，失败${failNumber}`,
      icon: "error",
    });
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
  } finally {
    loading.value = false;
    console.log("最终结果", resp);
  }
}

function getAllFailHistorys() {
  const batchBaseUrl = getBatchBaseUrlName();
  console.log("当前地址", batchBaseUrl);
  if (batchBaseUrl === "地址3" || batchBaseUrl === "地址4") {
    getNewHistorys("fail");
  } else {
    getHistorys("history", "fail");
  }
}

function getAllFailOnline() {
  const batchBaseUrl = getBatchBaseUrlName();
  if (batchBaseUrl === "地址3" || batchBaseUrl === "地址4") {
    getNewOnline("fail");
  } else {
    getHistorys("online", "fail");
  }
}
</script>
