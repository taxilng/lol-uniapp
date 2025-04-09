<template>
  <uv-modal
    ref="passwordModalRef"
    title="请联系卖家询问密码"
    :showCancelButton="true"
    :asyncClose="true"
    @confirm="confirmPassword"
  >
    <view class="slot-content">
      <uv-input
        v-model="password"
        style="background-color: #fff"
        placeholder="请输入密码"
        border="surround"
      >
      </uv-input>
    </view>
  </uv-modal>
  <uv-toast ref="toastRef"></uv-toast>
</template>

<script setup>
import { ref, defineEmits } from "vue";
import { PermanentPassword, TemporaryPassword } from './constant'
const emit = defineEmits(["passwordConfirmed"]);
const passwordModalRef = ref();
function showPasswordModal() {
  passwordModalRef.value.open();
}
const password = ref("");
const toastRef = ref();
function confirmPassword() {
  console.log("走不密码", password.value);
  // 临时密码
  const tempPasswordLocalList = uni.getStorageSync("tempPasswordLocalList");
  const flag = !tempPasswordLocalList?.includes(password.value) && TemporaryPassword.some(v => v.value === password.value)
  if (!(password.value === PermanentPassword || flag)) {
    toastRef.value.show({
      message: "密码错误",
      type: "error",
    });
    passwordModalRef.value.closeLoading();
    return;
  }
  passwordModalRef.value.close();
  uni.setStorageSync("password", password.value);
  if(flag) {
    uni.setStorageSync("tempPasswordLocalList", [...tempPasswordLocalList, password.value]);
    const timer = TemporaryPassword.find(v => v.value === password.value)?.time
    const firstUseTime = Date.now() + (timer - 15) * 24 * 60 * 60 * 1000
    uni.setStorageSync("firstUseTime", firstUseTime);
  }
  emit("passwordConfirmed");
}

//首次使用时间保存
const firstUseTime = uni.getStorageSync("firstUseTime");
if (!firstUseTime) {
  uni.setStorageSync("firstUseTime", Date.now());
}
// 临时密码列表
const tempPasswordLocalList = uni.getStorageSync("tempPasswordLocalList");
if (!tempPasswordLocalList) {
  uni.setStorageSync("tempPasswordLocalList", []);
}
// 校验是否超过15天
function checkPassword() {
  const now = Date.now();
  const fifteenDays = 15 * 24 * 60 * 60 * 1000;
  const firstUseTime = uni.getStorageSync("firstUseTime");
  const passwordStorage = uni.getStorageSync("password");
  if (now - firstUseTime > fifteenDays && passwordStorage !== PermanentPassword) {
    showPasswordModal();
    return;
  }
  return true;
}
defineExpose({
  checkPassword,
});
</script>
