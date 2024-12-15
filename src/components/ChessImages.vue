<!--
 * @Date: 2024-06-13 17:50:38
 * @LastEditTime: 2024-06-14 16:42:02
 * @Description: lol-技能图标
-->
<template>
  <view class="w-6 h-6 relative" :style="mystyle">
    <view class="absolute -top-4 w-full text-center">
      <view v-if="starNum === 2">
        <i class="star2"></i>
        <i class="star2"></i>
      </view>
      <view v-if="starNum === 3">
        <i class="star3"></i>
        <i class="star3"></i>
        <i class="star3"></i>
      </view>
    </view>

    <img
      v-if="iconId"
      class="w-6 h-6"
      :class="myclass"
      :style="mystyle"
      :src="`https://wegame.gtimg.com/g.26-r.c2d3c/helper/tft/${season}/images/chess/${iconId}.png`"
    />
  </view>
</template>

<script setup>
import { ref, watch } from "vue";
const mystyle = ref({});
const myclass = ref("");
const props = defineProps({
  iconId: [String, Number],
  season: [String],
  basePrice: [Number],
  starNum: [Number],
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
    if (props.basePrice) {
      myclass.value = `cost-${props.basePrice}`;
    }
  },
  { deep: true, immediate: true }
);
</script>

<style lang="scss">
.cost-1 {
  border: 2px solid #707070;
}
.cost-2 {
  border: 2px solid #10a17b;
}
.cost-3 {
  border: 2px solid #1d70b8;
}
.cost-4 {
  border: 2px solid #a635ba;
}
.cost-5 {
  border: 2px solid #e09e26;
}
.star3 {
  display: inline-block;
  width: 18rpx;
  height: 18rpx;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  vertical-align: middle;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAiCAYAAAA3WXuFAAAD20lEQVRYhcWYTWgbRxSAv10pRptYchMSN7Ji14nj1Bga8tMUCi0Ne9Ah9NBbCj30EFoorcGE9BByUE85JQdDqKE5F3ooNOct3Za4CbQkNKTFBMcB17Ikr0ltp3EsYe9PD7OSR2tpbUmx+mCZmTfvPX28N39I+emrbhoVPR2tGpuG/Y6v/3VbAd7O1Z1SG6YJiGnY7wMTwITfb0laBgI+q9NvSloCMg37PeCcpDrn6/4fIPyMDA2rDA2rVbq2A5mGfRo4D5BMqSRTlVDn/bn2AuFnYvB1FUUBRRF9ea5tQKZhHwMuAKR6N0JI/Qu+TXuA8DNwZFBFlSKoqtDJNu0AOgiMAvT2bXaXdKOmYSd3GugAMALQf0QlEtlsEImIOV9GTMM+0MgPKIGr41WgH+jzW/l7DdhTNnz3bJRdHbWDrq/DxM+2rHoB/A3MBL5ZYEbPWJYMlAQuIWquhdHv6gBNU0j1qiR7lDBTCnmPXNalWPRYXws1BSgC48D1qA9yEaCjA2KaQiwmWk2rHtcqUT1J9igke4SD40Cp6FEqibZYrB6vraH5DKvlDOVBbNujx2qvjZ0Qx4HpKZdc1i2rUipQAN4EyGVdpqdcSqWdhymVNsGc0TNWvrwd7gMDwHgu63L3ts3Kc2/HYFaee9y9bZdhxoEBPWPdA4h8fLaycZaAO0ACOJOb83hlr4KmhS/eRmVp0eP+7055+DVwRc9YhbIiGrBfBj4HXOCLP+45HD8RYX/3y4F6uuDx8EEF5oaesUaCNvUOxhFgDODhA4f5Quvlm89XwYzVggkDAnE9XAeY/NPh2XLzUMvLHpN/VWCu6RlrtJ7tVlfHJeAqIO+GhkXyvaqno1+G2W7nLnsBEIs1v44k35WtbLcDdAKgM9E8UHzD9+TLADoFEI83zSP7nmoVqAtxYKLtbj5Dku+AadhdrQCdBNi7rz6M48DsjMvsjIvj1DWTY4SWLXgw1gTqjG8G8jwB8uTxxu6bnnIZGFTp6xcPf1k64wpLi1455i8tAcUDQPk5l0eTVcfAGOABo08eC8ihYZWeQxsFkGK0lCGxoBNi8HTBYy7rsvhP5ZD8FhjX09E7AKZhf494X330aNJlwfI41Kuyv1upxGCLhR18wsqiAasAp9+KkMu68hXyow/yQy1H07A/8MHSAAeT4pUpXap79Iy1Wss3LEPHARJdihwI4FM9Hb0Z4oeejt4CbpmG/QnwzXzBY77gkOhS+PeZB/AG8Fst37BddhgoBwC4DESAUJgA2E3f53Ig1uF6PmElA/gQSCEeUZUUB/+w2o6Yhr0bUcacnrG+q2f3Hx6HWGpcdjWpAAAAAElFTkSuQmCC);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  vertical-align: middle;
}

.star2 {
  display: inline-block;
  width: 18rpx;
  height: 18rpx;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  vertical-align: middle;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAiCAYAAAA3WXuFAAABS2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIi8+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJyIj8+nhxg7wAABBRJREFUWIXFlt9rW2UYxz9p0yVdU8f6I222Nm3JWu1E6Y+tEyJ4I16UXQhejCjkosOBaKHIvHB/wPDCXVRkBYUDXjg2ENyFwQt3oc4DeoxSNJi4dl2S2uVHa7e2SZe0WfQi58S3aU6aH1194HDe93m/z3M+vO/zvu8xjF/7jEptYsy5oy8p8ouq/4dy4l9zOHTH6iqmKTBJkc8Ct4HbarsmqxkIeEunXZXVBCQp8kvAuOAaV33/DxDqjDh7HTh7HTt8Bw4kKfIocA5gwNrJgLVTGzqnjh0sEOpMnLH3YQAMalscOzAgSZEHgPMAgx22vF9on1c1BwOEOgOjXT3UGQz/JTMYGO3q2aE5CKBOYArgpDA7mj3bmfdNSYq8W7DPQO3AJMDQsW4a6ut3CYx19Qwd69a6k5Iit1fyAUPB1dEB9AJ29S0+PUCTJnx9ZAyzsaFo0lRmm2u/KqIrCYSAYMETBoIelzsmAtmAi+TWvLEUvdnYQLPZzDPWTvrbrKWkzK3ECcSjbKRSpDLbJbXAI2AGuGJUQd4FaGxowGIyYzlkwmLKPc2HzPm2sW73EulZf5s1D53JPiaRTpNIp9nYSuXbia00iXSKR9vbjSrDpjZD9wEGrTZO23sq+nAtlsk+5udwCH88ormO1wER4BSAPx5BCQdJbqWfOExyK40SDoowpz0u931tl/0COICZQDzKjVkvq5vJJwazupnkxqyXQDwKudpxeFxuL+zc9gvAJeAqwE3fLJH1tX2HiayvcdM3q3WvApc8LveC5jAW6B8CbwNZ4J2vAz5e7h/EfrRlX2DCD1a5NefXuh97XO7JQo3ewTgJTAPcmvNz9+/lmmHmV+IizHQxmFJAkLsergB8d/cOscR61TCxjXW+X5jTuh96XO4pPe1eV8dF4DJAIBatGkgtXoDLE2PO90ppy7nLkgAWk6lqICE2sZe2HKAhgJbDTXvpdE2IHd4PoBGAtiZL1UBC7EitQEfIHZg0m8xVAwmxDkmRj9QCNAxge0o/RyabxRddwhddIpPN6uqEHCWXrfBgLApUrH7+AX6P/IV3MZT3KeEgp7p7eM7WhaFA33K4STv5h4FvawJqLQD6czmGfG9edE2rjFPexRDexRDOvhM83d6RF7SWWdh7AY0AtKpFGX6wij8eYWntoTb+OTAzMeaUASRF/oLc/9Ub8r15gqsrDFpt2I+25HOwR2EX/sKK1ghsApw9+Tz+WES8Qr5RQb4sFigp8qsq2CsAjtZ2BjtsfPXHb5qkyeNyb1YKdAb4sd3SzHJiQ/RfmBhzfqoXVAD2JvCJ1hdyveBxuX8qFlNql/UBIsz7QD1QFgyACl6vxoq5+vRiStXQdfV9nNxPVNEpLgMqC3wgKfJH5JZxyeNyX9fT/wuc8V074fv0swAAAABJRU5ErkJggg==);
}
</style>
