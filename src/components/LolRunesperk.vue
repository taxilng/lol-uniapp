<!--
 * @Date: 2024-06-13 17:50:38
 * @LastEditTime: 2024-06-14 16:41:52
 * @Description: lol-天赋图标
-->
<template>
  <view class="shadow-sm bg-gray-200 w-6 h-6">
    <img
      v-if="iconId"
      class="w-6 h-6"
      :src="`https://wegame.gtimg.com/g.26-r.c2d3c/helper/lol/assis/images/resources/runesperk/${iconId}.png`"
    />
  </view>
</template>

<script setup>
defineProps({
  iconId: [String, Number]
})
</script>

<style lang="scss" scoped></style>
