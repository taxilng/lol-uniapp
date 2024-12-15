<!--
 * @Date: 2024-06-13 17:50:38
 * @LastEditTime: 2024-06-14 16:42:02
 * @Description: lol-技能图标
-->
<template>
  <view class="w-6 h-6" :style="mystyle">
    <img
      v-if="iconId"
      class="w-6 h-6"
      :style="mystyle"
      :src="`https://wegame.gtimg.com/g.26-r.c2d3c/helper/lol/v2/tft-game-score-level/${iconId}.png`"
    />
  </view>
</template>

<script setup>
import { ref, watch } from "vue";
const mystyle = ref({});
const props = defineProps({
  iconId: [String, Number],
  size: [String, Number],
});

watch(
  props,
  () => {
    if (props.size) {
      mystyle.value = {
        width: `${props.size}rpx`,
        height: `${props.size}rpx`,
      };
    }
  },
  { deep: true, immediate: true }
);
</script>

<style lang="scss" scoped></style>
