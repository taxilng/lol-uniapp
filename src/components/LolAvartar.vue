<template>
  <view class="shadow-sm" v-if="iconId" @click="handleClick">
    <img
      class="w-10 h-10 rounded-full"
      :class="{ myrotate: loading }"
      :src="baseUrl"
      @error="onImgError"
    />
  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  iconId: [String, Number],
  loading: Boolean,
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')
}

// 默认用 down.qq.com 的 jpg，加载失败降级到 wegame.gtimg.com 的 png
const loadFailed = ref(false)
const baseUrl = computed(() =>
  loadFailed.value
    ? `https://wegame.gtimg.com/g.26-r.c2d3c/helper/lol/assis/images/resources/usericon/${props.iconId}.png`
    : `https://down.qq.com/lolapp/lol/summoner/profileicon/${props.iconId}.jpg`
)
function onImgError() {
  loadFailed.value = true
}
watch(
  () => props.iconId,
  () => {
    loadFailed.value = false
  }
)
</script>

<style lang="scss" scoped>
.myrotate {
  animation: rotate1 10s linear infinite;
}

@keyframes rotate1 {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.w-10 {
  width: 100rpx;
}
.h-10 {
  height: 100rpx;
}
.rounded-full {
  border-radius: 50%;
}
</style>
