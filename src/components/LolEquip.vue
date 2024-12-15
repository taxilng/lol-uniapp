<!--
 * @Date: 2024-06-13 17:50:38
 * @LastEditTime: 2024-06-14 16:28:11
 * @Description: lol-装备图标
-->
<template>
  <div class="shadow-sm bg-gray-200 w-6 h-6 m-0.5">
    <img
      v-if="iconId"
      class="w-6 h-6"
      :src="`https://wegame.gtimg.com/g.26-r.c2d3c/helper/lol/assis/images/resources/items/${iconId}.png`"
    />
  </div>
</template>

<script setup>
defineProps({
  iconId: [String, Number]
})
</script>

<style lang="scss" scoped></style>
