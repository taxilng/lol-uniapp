import { ref } from "vue";

const useRewardedVideoAd = () => {
  const videoAd = ref(null);

  const initVideoAd = () => {
    /* #ifdef MP-WEIXIN */
    if (wx.createRewardedVideoAd) {
      videoAd.value = wx.createRewardedVideoAd({
        adUnitId: "adunit-f85f2c1089f21ddb",
        // adUnitId: "adunit-48d126bade430601",
      });
      videoAd.value.onLoad(() => {});
      videoAd.value.onError(err => {
        console.error("激励视频广告加载失败", err);
      });
      console.log("解析值啊", videoAd.value);
    }
    /* #endif */
  };

  const showVideoAd = onAdClose => {
    /* #ifdef MP-WEIXIN */
    console.log("videoAd 实例", videoAd.value);
    if (videoAd.value) {
      // 移除之前的 onClose 回调
      if (videoAd.value.offClose) {
        videoAd.value.offClose();
      }
      videoAd.value.onClose(res => {
        if (res && res.isEnded) {
          if (typeof onAdClose === "function") {
            onAdClose();
          }
        } else {
          console.log("用户未完整观看广告，不给予奖励");
        }
      });
      videoAd.value.show().catch(() => {
        videoAd.value
          .load()
          .then(() => videoAd.value.show())
          .catch(err => {
            console.error("激励视频 广告显示失败", err);
          });
      });
    }
    /* #endif */
  };

  return {
    initVideoAd,
    showVideoAd,
  };
};

export default useRewardedVideoAd;
