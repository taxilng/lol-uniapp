<template>
  <view class="max-w-screen-xl mx-auto h-full overflow-y-auto p-4">
    <uv-form labelPosition="top" labelWidth="200">
      <uv-form-item
        label="批量查询的额外召唤师"
        borderBottom
        @click="openRolePick"
      >
        <uv-input
          disabled
          disabledColor="#ffffff"
          placeholder="请选择"
          border="none"
        >
        </uv-input>
        <template v-slot:right>
          <uv-icon name="arrow-right"></uv-icon>
        </template>
      </uv-form-item>
      <uv-form-item label="默认选中召唤师" borderBottom @click="openRolePick2">
        <uv-input
          disabled
          disabledColor="#ffffff"
          placeholder="请选择"
          border="none"
        >
        </uv-input>
        <template v-slot:right>
          <uv-icon name="arrow-right"></uv-icon>
        </template>
      </uv-form-item>
      <uv-form-item label="默认页面" borderBottom @click="openRolePick3">
        <uv-input
          v-model="defaultPage"
          disabled
          disabledColor="#ffffff"
          placeholder="请选择"
          border="none"
        >
        </uv-input>
        <template v-slot:right>
          <uv-icon name="arrow-right"></uv-icon>
        </template>
      </uv-form-item>
      <!-- <uv-form-item label="展示模式" borderBottom @click="openRolePick5">
        <uv-input
          v-model="displayModeValue"
          disabled
          disabledColor="#ffffff"
          placeholder="请选择"
          border="none"
        >
        </uv-input>
        <template v-slot:right>
          <uv-icon name="arrow-right"></uv-icon>
        </template>
      </uv-form-item> -->
      <uv-form-item label="接口地址" borderBottom @click="openRolePick4">
        <uv-input
          v-model="baseUrl"
          disabled
          disabledColor="#ffffff"
          placeholder="请选择"
          border="none"
        >
        </uv-input>
        <template v-slot:right>
          <uv-icon name="arrow-right"></uv-icon>
        </template>
      </uv-form-item>
    </uv-form>
    <view class="mb-2">
      <text class="mr-2">数据合并</text>
    </view>
    <view class="text-sm">
      <text class="inline-block w-36">源数据</text>
      <text>合并到</text>
    </view>
    <view class="mt-2 flex" v-for="(single, index) in mergeList" :key="index">
      <view @click="openMergePick('source', index)">
        <uv-input
          v-model="single.sourceName"
          disabled
          disabledColor="#ffffff"
          placeholder="请选择"
          border="none"
        >
        </uv-input>
      </view>
      <view @click="openMergePick('target', index)">
        <uv-input
          v-model="single.targetName"
          disabled
          disabledColor="#ffffff"
          placeholder="请选择"
          border="none"
        >
        </uv-input>
      </view>
      <uv-button
        size="small"
        :plain="true"
        type="error"
        @click="deleteLine(index)"
        >删除</uv-button
      >
    </view>
    <view class="mt-2">
      <uv-button size="small" type="success" @click="addLine"
        >添加一行</uv-button
      >
    </view>
    <view class="flex flex-wrap items-center mt-2">
      <view class="mr-4">
        <uv-button
          size="small"
          type="primary"
          text="确认"
          @click="saveLine"
        ></uv-button>
      </view>
    </view>
    <!-- <view class="mb-4 mt-4">
      <uv-link href="http://www.jddld.com/" text="大乱斗buff查询"></uv-link>
    </view>
    <uv-link
      href="https://lol.qq.com/gicp/news/423/2/1334/1.html"
      text="LOL版本公告"
    ></uv-link> -->
    <uv-tabs
      :list="tabAccountList"
      @click="changtab"
      :current="activeTab"
    ></uv-tabs>
    <view v-if="activeTab === 0">
      <view class="mt-4 flex items-center">
        <uv-input
          v-model="userInfo.username"
          @input="usernameChange"
          placeholder="请输入账号"
          border="bottom"
          clearable
        ></uv-input>
      </view>
      <view class="mt-4 flex items-center" v-if="registerFlag">
        <uv-input
          v-model="userInfo.phone"
          placeholder="请输入手机号"
          border="bottom"
          clearable
        ></uv-input>
      </view>
      <view class="mt-4 flex items-center" v-if="registerFlag">
        <uv-input
          v-model="userInfo.email"
          placeholder="请输入邮箱"
          border="bottom"
          clearable
        ></uv-input>
      </view>

      <view class="mt-4">过期时间 {{ expireTime }} </view>
      <view class="flex flex-wrap items-center mt-2">
        <view class="mr-4"  v-if="!registerFlag">
          <uv-button
            size="small"
            type="primary"
            text="去注册"
            @click="registerFlag = true"
          ></uv-button>
        </view>
        <view class="mr-4" v-if="registerFlag">
          <uv-button
            size="small"
            type="primary"
            text="注册"
            @click="register"
          ></uv-button>
        </view>
        <view class="mr-4">
          <uv-button
            size="small"
            type="primary"
            text="登录"
            @click="loginIN"
          ></uv-button>
        </view>
      </view>
    </view>
    <view v-if="activeTab === 1">
      <template v-if="syncUsernameLogged">
        <view class="flex items-center">
          <text class="mr-4">欢迎登陆，{{ syncUsernameLogged }}</text>
          <uv-button
            type="error"
            size="small"
            :loading="loading"
            @click="logout"
            >退出</uv-button
          >
        </view>
        <view class="flex flex-wrap items-center mt-2">
          <view class="mr-4">
            <uv-button
              size="small"
              type="primary"
              icon="arrow-downward"
              plain
              text="同步"
              :loading="loading"
              @click="synchronous"
            ></uv-button>
          </view>
          <view class="mr-4">
            <uv-button
              size="small"
              type="success"
              icon="arrow-upward"
              plain
              text="备份"
              :loading="loading"
              @click="backups"
            ></uv-button>
          </view>
        </view>
      </template>
      <template v-else>
        <view class="mt-4 flex items-center">
          <uv-input
            v-model="syncUsername"
            placeholder="请输入账号"
            border="bottom"
            clearable
          ></uv-input>
        </view>

        <view class="mt-4 flex items-center" v-if="captchaBase64">
          <uv-input
            v-model="captcha"
            placeholder="请输入验证码"
            border="bottom"
            clearable
          ></uv-input>
          <img
            class="w-20 h-6"
            :src="captchaBase64"
            @click="queryCaptcha('refreshCaptcha')"
          />
        </view>
        <view class="flex flex-wrap items-center mt-2">
          <view class="mr-4" v-if="!captchaBase64">
            <uv-button
              size="small"
              type="primary"
              text="去注册"
              :loading="loading"
              @click="queryCaptcha('createCaptcha')"
            ></uv-button>
          </view>
          <view class="mr-4" v-if="captchaBase64">
            <uv-button
              size="small"
              type="primary"
              text="注册"
              :loading="loading"
              @click="syncRegister"
            ></uv-button>
          </view>
          <view class="mr-4">
            <uv-button
              size="small"
              type="primary"
              text="登录"
              :loading="loading"
              @click="syncLoginIN"
            ></uv-button>
          </view>
        </view>
      </template>
    </view>
    <view
      class="flex flex-wrap items-center pt-2 mt-2 mb-2 border-t-2 border-gray-300"
    >
      <view class="mr-4">
        <uv-button
          size="small"
          type="primary"
          text="显示日志"
          @click="showLogs = !showLogs"
        ></uv-button>
      </view>
      <view class="mr-4">
        <uv-button
          size="small"
          type="primary"
          text="部分清除缓存"
          @click="clearpart"
        ></uv-button>
      </view>
      <view class="mr-4">
        <uv-button
          size="small"
          type="primary"
          text="全部清除缓存"
          @click="clearAll"
        ></uv-button>
      </view>
    </view>
    <view clss="mt-4">
      <uv-textarea
        v-model="storageStr"
        :maxlength="-1"
        placeholder="本地缓存的数据"
      ></uv-textarea>
    </view>
    <view class="flex flex-wrap items-center mt-2">
      <view class="mr-4">
        <uv-button
          size="small"
          type="primary"
          text="导入"
          @click="importStorage"
        ></uv-button>
      </view>
      <view class="mr-4">
        <uv-button
          size="small"
          type="primary"
          text="导出"
          @click="exportStorage"
        ></uv-button>
      </view>
    </view>
    <view class="mb-4 mt-4" v-if="showLogs">
      <sv-json-view :obj="searchLogs" :key="jsonviewKey"></sv-json-view>
    </view>
    <multiple-select
      v-model="show"
      :data="userOptions"
      :default-selected="user"
      @confirm="confirmRole"
    ></multiple-select>
    <multiple-select
      v-model="show2"
      :data="allUserOptions"
      :default-selected="selectedUser"
      @confirm="confirmRole2"
    ></multiple-select>
    <uv-picker
      ref="pickerRef"
      :columns="[tabList]"
      keyName="name"
      @confirm="modeconfirm"
    ></uv-picker>
    <uv-picker
      ref="pickerRef4"
      :columns="[baseUrlList]"
      keyName="name"
      @confirm="modeconfirm4"
    ></uv-picker>
    <uv-picker
      ref="pickerRef5"
      :columns="[DisplayMode]"
      keyName="label"
      @confirm="modeconfirm5"
    ></uv-picker>
    <uv-picker
      ref="pickerMergeRef"
      :columns="[allUserOptions]"
      keyName="label"
      @confirm="mergeConfirm"
    ></uv-picker>
  </view>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { onShow, onLoad } from "@dcloudio/uni-app";
import {
  defaultUser,
  tabList,
  baseUrlList,
  DisplayMode,
} from "@/utils/area.js";
import { parseTime, getGuid } from "@/utils/auth.js";
import { EventBus } from "@/utils/event-bus.js";
import multipleSelect from "@/components/multiple-select";
import { joinUN_USE, userLogin, profile, getBspapp } from "@/axios/api.js";

const jsonviewKey = ref(0);

onMounted(() => {
  init();
});

function init() {
  initUserOptions();
  initselectedUserOptions();
  initBaseUrl();
  initDefaultPage();
  initAuth();
  // initDisplayMode();
  initMergeList();
  initSyncAccount();
}

const user = ref([]);
const userOptions = ref([]);
const allUserOptions = ref([...defaultUser]);

const searchLogs = uni.getStorageSync("searchLogs");

// 清除缓存
function clearpart() {
  uni.removeStorageSync("singlePlayerRecord");
  uni.removeStorageSync("searchLogs");
  uni.removeStorageSync("lol");
  uni.removeStorageSync("userHistory");
  uni.removeStorageSync("userHistoryDetails");
}

function clearAll() {
  uni.clearStorage();
}
// 日志展示
const showLogs = ref(false);

// 注册账号
const userInfo = ref({
  username: "",
  phone: "",
  email: "",
});
function usernameChange(val) {
  console.log("账号变化", val, userInfo.value);
  const str = val.slice(2);
  userInfo.value.phone = `135718625${str}`;
  userInfo.value.email = `${val}@qq.com`;
}

// 注册按钮控制
const registerFlag = ref(false)
function register() {
  joinUN_USE({
    ...userInfo.value,
    password: "123456",
    gender: 1,
    inviteCode: "",
  }).then(res => {
    console.log("注册成功", res);
    if (res?.data?.success === false) {
      uni.showToast({
        title: res.data?.error?.message,
        icon: "error",
      });
    } else {
      loginIN();
    }
  });
}

// 登录
function loginIN() {
  userLogin({
    username: userInfo.value.username,
    password: "123456",
  }).then(res => {
    console.log("登陆后", res);
    if (res.data?.success) {
      uni.showToast({
        title: "登陆成功",
        icon: "success",
      });
      uni.setStorageSync("m3-authorization", res.data?.data?.wt);
      getProfile();
    } else {
      uni.showToast({
        title: res.data?.error?.message,
        icon: "error",
      });
    }
  });
}

const expireTime = ref("");
// 获取用户信息
function getProfile() {
  profile().then(res => {
    console.log("用户信息", res);
    if (res.data?.success) {
      expireTime.value = parseTime(res?.data?.data?.expireTime);
      uni.setStorageSync("authorization", JSON.stringify(res.data?.data));
      getStorageStr();
    } else {
      uni.showToast({
        title: res.data?.error?.message,
        icon: "error",
      });
    }
  });
}

const authObj = ref({});
function initAuth() {
  try {
    const auth = JSON.parse(uni.getStorageSync("authorization"));
    if (auth && typeof auth === "object") {
      authObj.value = auth;
      userInfo.value.username = auth.username;
      expireTime.value = parseTime(auth?.expireTime);
    }
  } catch (error) {
    console.log("查询登录账号报错", error);
  }
}

onShow(() => {});

// 默认页面
const pickerRef = ref();
function openRolePick3() {
  pickerRef.value.open();
}
function modeconfirm(e) {
  console.log("默认页面", e);
  uni.setStorageSync("defaultPage", e?.indexs?.[0]);
  defaultPage.value = e?.value?.[0]?.name;
  // mode.value = e.value?.[0]?.value;
  // modeName.value = e.value?.[0]?.label;
  getStorageStr();
}

// 展示模式
const pickerRef5 = ref();
function openRolePick5() {
  pickerRef5.value.open();
}

const displayModeValue = ref("普通");
function modeconfirm5(e) {
  console.log("展示模式", e);
  uni.setStorageSync("displayMode", e?.indexs?.[0]);
  displayModeValue.value = e?.value?.[0]?.label;
  EventBus.emit("updateOption");
}
function initDisplayMode() {
  const idx = uni.getStorageSync("displayMode");
  const name = DisplayMode?.[idx]?.label ?? "普通";
  displayModeValue.value = name;
}

const defaultPage = ref("查询用户");
function initDefaultPage() {
  const idx = uni.getStorageSync("defaultPage");
  const name = tabList?.[idx]?.name ?? "查询用户";
  defaultPage.value = name;
}

// 接口地址
const pickerRef4 = ref();
function openRolePick4() {
  pickerRef4.value.open();
}
function modeconfirm4(e) {
  console.log("接口地址", e);
  uni.setStorageSync("baseUrl", String(e?.indexs?.[0]));
  baseUrl.value = e?.value?.[0]?.name;
  EventBus.emit("updateBaseUrl");
  getStorageStr();
}

const baseUrl = ref("地址1");
function initBaseUrl() {
  const idx = uni.getStorageSync("baseUrl");
  const urlName = baseUrlList?.[idx]?.name ?? "地址1";
  baseUrl.value = urlName;
}

const show = ref(false);
function openRolePick() {
  show.value = true;
}
function confirmRole(data) {
  console.log("选择的", data);
  uni.setStorageSync("userList", JSON.stringify(data));
  getStorageStr();
}

const show2 = ref(false);
function openRolePick2() {
  show2.value = true;
}
function confirmRole2(data) {
  console.log("选择的2", data);
  const newData = data.map(v => v.value);
  uni.setStorageSync("selectedUserList", JSON.stringify(newData));
  EventBus.emit("updateOption");
  getStorageStr();
}

function initUserOptions() {
  // 批量查询增加额外的召唤师
  const userList = uni.getStorageSync("userList");
  try {
    if (userList && Array.isArray(JSON.parse(userList))) {
      const userListArr = JSON.parse(userList);
      userOptions.value = userListArr;
      allUserOptions.value = [...defaultUser, ...userListArr];
      user.value = userListArr.map(v => v.value);
    }
  } catch (error) {
    console.log("召唤师报错", error);
  }
}

const selectedUser = ref([]);
function initselectedUserOptions() {
  // 批量查询增加额外的召唤师
  const selectedUserList = uni.getStorageSync("selectedUserList");
  try {
    if (selectedUserList && Array.isArray(JSON.parse(selectedUserList))) {
      const selectedUserArr = JSON.parse(selectedUserList);
      selectedUser.value = selectedUserArr;
    }
  } catch (error) {
    console.log("默认召唤师报错", error);
  }
}

onMounted(() => {
  getStorageStr();
});

// 本地缓存的导入和导出
const storageStr = ref("");
function getStorageStr() {
  const storageObj = {
    baseUrl: uni.getStorageSync("baseUrl"),
    selectedUserList: uni.getStorageSync("selectedUserList"),
    "m3-authorization": uni.getStorageSync("m3-authorization"),
    authorization: uni.getStorageSync("authorization"),
    defaultPage: uni.getStorageSync("defaultPage"),
    displayMode: uni.getStorageSync("displayMode"),
    searchHistoryLocal: uni.getStorageSync("searchHistoryLocal"),
    searchYundingHistoryLocal: uni.getStorageSync("searchYundingHistoryLocal"),
    userList: uni.getStorageSync("userList"),
    mergeList: uni.getStorageSync("mergeList"),
  };
  storageStr.value = JSON.stringify(storageObj);
}

function importStorage() {
  try {
    const storageObj = JSON.parse(storageStr.value);
    Object.keys(storageObj).forEach(key => {
      uni.setStorageSync(key, storageObj[key]);
    });
    EventBus.emit("updateOption");
    init();
    uni.showToast({
      title: "导入成功",
      icon: "success",
    });
  } catch (error) {
    console.log("Error: ", error);

    uni.showToast({
      title: "导入失败",
      icon: "error",
    });
  }
}
function exportStorage() {
  uni.setClipboardData({
    data: storageStr.value,
    success: () => {
      uni.showToast({
        title: "复制成功",
        icon: "success",
      });
    },
    fail: err => {
      console.error("复制失败:", err);
      uni.showToast({
        title: "复制失败",
        icon: "error",
      });
    },
  });
}

const mergeList = ref([
  { source: "", sourceName: "", target: "", targetName: "" },
]);

function addLine() {
  mergeList.value.push({
    source: "",
    sourceName: "",
    target: "",
    targetName: "",
  });
}

function deleteLine(index) {
  mergeList.value.splice(index, 1);
}

function saveLine() {
  uni.setStorageSync("mergeList", JSON.stringify(mergeList.value));
  getStorageStr();
}

function initMergeList() {
  const mergeListStr = uni.getStorageSync("mergeList");
  try {
    if (mergeListStr && Array.isArray(JSON.parse(mergeListStr))) {
      const mergeListArr = JSON.parse(mergeListStr);
      mergeList.value = mergeListArr.map(v => {
        let sourceName = v.sourceName;
        if (!sourceName) {
          sourceName = allUserOptions.value.find(
            x => x.value === v.source
          )?.label;
        }

        let targetName = v.targetName;
        if (!targetName) {
          targetName = allUserOptions.value.find(
            x => x.value === v.target
          )?.label;
        }

        return { ...v, sourceName, targetName };
      });
    }
  } catch (error) {
    console.log("合并数据有问题", error);
  }
}

const pickerMergeRef = ref();
const mergeInput = ref({});
function openMergePick(type, index) {
  mergeInput.value = {
    type,
    index,
    name: `${type}Name`,
  };
  pickerMergeRef.value.open();
}

function mergeConfirm(e) {
  console.log("选择合并", e);
  const index = mergeInput.value.index;
  const type = mergeInput.value.type;
  const name = mergeInput.value.name;
  const confirmDate = e.value?.[0];
  mergeList.value[index][type] = confirmDate?.value;
  mergeList.value[index][name] = confirmDate?.label;
}

const activeTab = ref(0);
function changtab(item) {
  console.log("item", item);
  activeTab.value = item.index;
}
const tabAccountList = [
  {
    name: "接口账号",
    value: "api",
  },
  {
    name: "同步账号",
    value: "synchronous",
  },
];

// 同步账号
const captchaBase64 = ref("");

// 获取验证码
function queryCaptcha(action) {
  loading.value = true;
  getBspapp({
    action,
    params: {
      deviceId: deviceId.value,
      scene: "register",
    },
  })
    .then(res => {
      console.log("验证码2", res);
      captchaBase64.value = res.data?.captchaBase64;
    })
    .finally(() => {
      loading.value = false;
    });
}
onMounted(() => {
  getDeviceId();
});

const deviceId = ref();
function getDeviceId() {
  let deviceIdStr = uni.getStorageSync("deviceId");
  if (!deviceIdStr) {
    deviceIdStr = getGuid();
    uni.setStorageSync("deviceId", deviceIdStr);
  }
  deviceId.value = deviceIdStr;
}

// 同步账号登录
const syncUsername = ref("");
const syncUsernameLogged = ref("");
const captcha = ref("");
const loading = ref(false);

function initSyncAccount() {
  syncUsernameLogged.value = uni.getStorageSync("syncUserName");
}
// 注册
function syncRegister() {
  loading.value = true;
  getBspapp({
    action: "register",
    params: {
      captcha: captcha.value,
      deviceId: deviceId.value,
      id: deviceId.value,
      username: syncUsername.value,
      password: "123456",
      scene: "register",
    },
  })
    .then(res => {
      console.log("注册后", res);
      if (res.data?.result?.code === 0) {
        uni.showToast({
          title: "注册成功",
          icon: "success",
        });
        syncUsernameLogged.value = res.data?.result?.username;
        uni.setStorageSync("syncToken", res.data?.result?.token);
        uni.setStorageSync("syncUserName", res.data?.result?.username);
        getStorageStr();
      } else {
        uni.showToast({
          title: res.data?.message ?? res.data?.error?.message,
          icon: "error",
        });
      }
    })
    .finally(() => {
      loading.value = false;
    });
}
// 登录
function syncLoginIN() {
  loading.value = true;
  getBspapp({
    action: "login",
    params: {
      username: syncUsername.value,
      password: "123456",
    },
  })
    .then(res => {
      console.log("登陆后", res);
      if (res.data?.code === 0) {
        uni.showToast({
          title: "登陆成功",
          icon: "success",
        });
        syncUsernameLogged.value = res.data?.username;
        uni.setStorageSync("syncToken", res.data?.token);
        uni.setStorageSync("syncUserName", res.data?.username);
      } else {
        uni.showToast({
          title: res.data?.error?.message,
          icon: "error",
        });
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

// 退出登录
function logout() {
  loading.value = true;
  getBspapp({
    action: "logout",
    uniIdToken: uni.getStorageSync("syncToken"),
  })
    .then(res => {
      console.log("退出登录", res);
      if (res.data?.code === 0) {
        uni.showToast({
          title: "退出登录成功！",
          icon: "success",
        });
        syncUsernameLogged.value = "";
        uni.removeStorageSync("syncToken");
        uni.removeStorageSync("syncUserName");
      } else {
        uni.showToast({
          title: res.data?.msg ?? res.data?.error?.message,
          icon: "error",
        });
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

// 同步
function synchronous() {
  loading.value = true;
  getBspapp({
    action: "getUserInfo",
    params: {
      field: ["config_data"],
    },
    uniIdToken: uni.getStorageSync("syncToken"),
  })
    .then(res => {
      console.log("同步后", res);
      if (res.data?.code === 0) {
        const config_data = res.data?.userInfo?.config_data;
        if (config_data) {
          try {
            const storageObj = JSON.parse(config_data);
            Object.keys(storageObj).forEach(key => {
              uni.setStorageSync(key, storageObj[key]);
            });
            getStorageStr();
            EventBus.emit("updateOption");
            init();
            uni.showToast({
              title: "同步成功",
              icon: "success",
            });
          } catch (error) {
            console.log("Error: ", error);

            uni.showToast({
              title: "同步失败",
              icon: "error",
            });
          }
        }
      } else {
        uni.showToast({
          title: res.data?.msg ?? res.data?.error?.message,
          icon: "error",
        });
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

// 备份
function backups() {
  loading.value = true;
  getBspapp({
    action: "updateUser",
    params: {
      config_data: storageStr.value,
    },
    uniIdToken: uni.getStorageSync("syncToken"),
  })
    .then(res => {
      console.log("备份", res);
      if (res.data?.code === 0) {
        uni.showToast({
          title: "备份到云端成功！",
          icon: "success",
        });
      } else {
        uni.showToast({
          title: res.data?.msg ?? res.data?.error?.message,
          icon: "error",
        });
      }
    })
    .finally(() => {
      loading.value = false;
    });
}
</script>
