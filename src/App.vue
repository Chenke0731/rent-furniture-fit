<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
onLaunch(() => {})
</script>

<style>
page {
  background-color: #f7f5ee;
  background-image: radial-gradient(#d5cfc2 2.4rpx, transparent 2.4rpx);
  background-size: 36rpx 36rpx;
  color: #1a1917;
  font-size: 28rpx;
  line-height: 1.55;
  font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.page {
  padding: 24rpx 28rpx 210rpx;
}
.nb-card {
  background: #ffffff;
  border-radius: 36rpx;
  padding: 32rpx 30rpx;
  margin-bottom: 28rpx;
  position: relative;
  box-shadow: 0 18rpx 44rpx rgba(60, 45, 20, 0.09), 0 2rpx 8rpx rgba(60, 45, 20, 0.05);
}
.nb-card.tilt-l {
  transform: rotate(-0.8deg);
}
.nb-card.tilt-r {
  transform: rotate(0.8deg);
}
.tape {
  position: absolute;
  left: 50%;
  top: -16rpx;
  transform: translateX(-50%) rotate(-4deg);
  width: 150rpx;
  height: 38rpx;
  background: rgba(255, 212, 71, 0.62);
  border-radius: 4rpx;
}
.pill {
  display: inline-flex;
  align-items: center;
  height: 52rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #1a1917;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 700;
}
.pill-light {
  display: inline-flex;
  align-items: center;
  height: 52rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #ffffff;
  color: #1a1917;
  font-size: 24rpx;
  font-weight: 700;
  box-shadow: 0 4rpx 14rpx rgba(60, 45, 20, 0.08);
}
.hl {
  background: linear-gradient(transparent 58%, #ffd84d 58% 92%, transparent 92%);
  padding: 0 4rpx;
}
.section-title {
  font-size: 34rpx;
  font-weight: 900;
  margin-bottom: 12rpx;
}
.muted {
  color: #6e685c;
  font-size: 24rpx;
}
.btn {
  background: #1a1917;
  color: #ffffff;
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 92rpx;
  text-align: center;
  border: none;
  box-shadow: 0 10rpx 24rpx rgba(26, 25, 23, 0.18);
}
.btn::after {
  border: none;
}
.btn.yellow {
  background: #ffd84d;
  color: #1a1917;
  box-shadow: 0 10rpx 24rpx rgba(233, 168, 0, 0.22);
}
.btn[disabled] {
  background: #d8d3c8 !important;
  color: #8c8578 !important;
  box-shadow: none !important;
}
.btn-ghost {
  background: #ffffff;
  color: #1a1917;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 800;
  line-height: 88rpx;
  text-align: center;
  box-shadow: 0 6rpx 18rpx rgba(60, 45, 20, 0.08);
}
.btn-ghost::after {
  border: none;
}
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 28rpx calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(247, 245, 238, 0.94);
  backdrop-filter: blur(12px);
  border-top: 2rpx dashed #dcd6c8;
  display: flex;
  gap: 20rpx;
  align-items: center;
  z-index: 10;
}
.bottom-bar .btn,
.bottom-bar .btn-ghost {
  flex: 1;
  margin: 0;
}
.tag {
  display: inline-block;
  font-size: 22rpx;
  font-weight: 700;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  margin-right: 10rpx;
}
.tag-sample {
  background: #efece3;
  color: #6e685c;
}
.tag-manual {
  background: #fff2b8;
  color: #7a5400;
}
.seg {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}
.seg-item {
  flex: 1;
  min-width: 120rpx;
  text-align: center;
  padding: 14rpx 18rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  font-weight: 700;
  background: #efece3;
  color: #4a463e;
}
.seg-item.active {
  background: #1a1917;
  color: #ffffff;
}
</style>
