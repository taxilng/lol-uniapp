<template>
  <view class="shadow-sm" v-if="iconId" @click="handleClick">
    <img class="w-10 h-10 rounded-full" :class="{ myrotate: loading }" :src="baseUrl" />
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  iconId: [String, Number],
  loading: Boolean,
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')
}

const baseUrl = computed(
  () =>
    `https://wegame.gtimg.com/g.26-r.c2d3c/helper/lol/assis/images/resources/usericon/${props.iconId}.png`
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
