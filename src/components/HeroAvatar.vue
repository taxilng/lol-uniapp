<template>
  <view class="shadow-sm relative">
    <img
      class="w-10 h-10 rounded-full"
      :src="`https://wegame.gtimg.com/g.26-r.c2d3c/helper/lol/assis/images/resources/champions/${championId}.png`"
    />
    <view class="text-center">
      <i
        v-if="wasMvp || wasSvp"
        class="mvp-icon"
        :class="{
          'icon-mvp': wasMvp === 'mvp' || wasMvp === '1',
          'icon-svp': wasSvp === 'svp' || wasSvp === '1',
        }"
      ></i>
      <i v-if="damageMax" class="common-icon honor16 honor16-hurt2"></i>
      <i v-if="defenseMax" class="common-icon honor16 honor16-hurt"></i>
      <i v-if="killsMax" class="common-icon honor16 honor16-kill"></i>
      <i v-if="assistsMax" class="common-icon honor16 honor16-attack"></i>
      <i v-if="pentaKills" class="common-icon honor16 honor16-kill5"></i>
    </view>
  </view>
</template>

<script setup>
defineProps({
  championId: [String, Number],
  size: Number,
  wasMvp: String,
  wasSvp: String,
  damageMax: Boolean,
  defenseMax: Boolean,
  killsMax: Boolean,
  assistsMax: Boolean,
  pentaKills: Boolean,
});
</script>

<style lang="scss" scoped>
.mvp-icon {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
}
.common-icon {
  // position: absolute;
  // left: 50%;
  // bottom: -12px;
  // transform: translateX(-50%);
  margin-right: 2px;
}
</style>
