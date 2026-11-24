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
      :src="`https://game.gtimg.cn/images/lol/act/img/item/${iconId}.png`"
      @error="useFallbackSrc"
    />
  </div>
</template>

<script setup>
// 优先用 game.gtimg 的装备图，加载失败回退 wegame 图
const FALLBACK_HOST =
  "https://wegame.gtimg.com/g.26-r.c2d3c/helper/lol/assis/images/resources/items";

function useFallbackSrc(e) {
  const img = e?.target;
  if (!img || img.dataset.fallback) return;
  img.dataset.fallback = "1";
  const iconId = img.src.split("/").pop();
  img.src = `${FALLBACK_HOST}/${iconId.replace(".jpg", ".png")}`;
}

defineProps({
  iconId: [String, Number]
})
</script>

<style lang="scss" scoped></style>
