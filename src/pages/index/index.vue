<script setup lang="ts">
import { state } from '@/store'

const go = (url: string) => uni.navigateTo({ url })
</script>

<template>
  <view class="page">
    <view class="top-row">
      <text class="muted">我的出租屋本子 ⌄</text>
      <text class="pill">买前逐项核对</text>
    </view>

    <view class="hero-block">
      <view class="big-line">
        <text class="big-num">2—5</text>
        <text class="big-unit">款候选家具</text>
      </view>
      <view class="sub-line">
        先量好墙角与门宽，再贴进本子<text class="hl">逐项挑错</text>
      </view>
      <view class="stamp-badge">缺尺寸不瞎猜</view>
    </view>

    <!-- 3 张微旋转家具贴纸预览（纯 view + CSS，兼容微信小程序） -->
    <view class="sticker-row">
      <view class="st-card" style="transform: rotate(-2deg)">
        <view class="ico-box">
          <view class="desk-top" />
          <view class="desk-legs"><view class="leg" /><view class="leg" /></view>
        </view>
        <text class="st-name">书桌</text>
        <text class="muted">核对拉椅空间</text>
      </view>
      <view class="st-card" style="transform: rotate(1.5deg)">
        <view class="ico-box">
          <view class="shelf-frame">
            <view class="shelf-bar" />
            <view class="shelf-bar" />
          </view>
        </view>
        <text class="st-name">置物架</text>
        <text class="muted">核对限高打孔</text>
      </view>
      <view class="st-card" style="transform: rotate(-1.2deg)">
        <view class="ico-box">
          <view class="cab-box">
            <view class="cab-drawer"><view class="cab-knob" /></view>
            <view class="cab-drawer"><view class="cab-knob" /></view>
          </view>
        </view>
        <text class="st-name">收纳柜</text>
        <text class="muted">核对过门拆装</text>
      </view>
    </view>

    <!-- 贴胶带的主手账卡 -->
    <view class="nb-card tilt-l">
      <view class="tape" />
      <view class="card-headline">
        把看中的家具贴进来，<br />能放再比哪款值<text style="color: #e9a800">！</text>
      </view>
      <view class="chk-preview">
        <view class="p-row"><text class="ck">✓</text><text>量墙角净宽、墙到床距离、最窄门框净宽</text></view>
        <view class="p-row"><text class="ck">✓</text><text>先排除放不下、进不了门或违规打孔的款</text></view>
        <view class="p-row"><text class="ck y">!</text><text>商家没写包装尺寸时直接标出，不因便宜误判适配</text></view>
      </view>
    </view>

    <button class="btn" @tap="go(state.profileSaved ? '/pages/products/products' : '/pages/profile/profile')">
      {{ state.profileSaved ? '继续挑选候选家具' : '第 1 步 · 量角落建档' }}
    </button>
    <button v-if="state.profileSaved" class="btn-ghost mt" @tap="go('/pages/profile/profile')">
      修改我的租房尺寸档案
    </button>

    <view class="exp-entry" @tap="go('/pages/experiment/index')">
      <text class="pill-light">实验模式 · 对照任务与数据导出</text>
    </view>
  </view>
</template>

<style scoped>
.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}
.hero-block {
  position: relative;
  margin-bottom: 28rpx;
}
.big-line {
  display: flex;
  align-items: baseline;
  gap: 14rpx;
}
.big-num {
  font-size: 96rpx;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -4rpx;
}
.big-unit {
  font-size: 40rpx;
  font-weight: 900;
}
.sub-line {
  font-size: 32rpx;
  font-weight: 800;
  margin-top: 8rpx;
}
.stamp-badge {
  position: absolute;
  right: 8rpx;
  top: 12rpx;
  transform: rotate(-6deg);
  background: #fff5c0;
  border: 3rpx solid #946800;
  color: #7a5400;
  font-size: 22rpx;
  font-weight: 800;
  padding: 6rpx 18rpx;
  border-radius: 14rpx;
  box-shadow: 0 6rpx 14rpx rgba(60, 45, 20, 0.1);
}
.sticker-row {
  display: flex;
  gap: 18rpx;
  margin-bottom: 34rpx;
}
.st-card {
  flex: 1;
  background: #ffffff;
  border-radius: 28rpx;
  padding: 20rpx 12rpx;
  text-align: center;
  box-shadow: 0 12rpx 28rpx rgba(60, 45, 20, 0.08);
}
.ico-box {
  height: 82rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.desk-top {
  width: 96rpx;
  height: 14rpx;
  border-radius: 6rpx;
  background: #d9a066;
}
.desk-legs {
  width: 78rpx;
  display: flex;
  justify-content: space-between;
}
.leg {
  width: 10rpx;
  height: 44rpx;
  background: #2a2825;
  border-radius: 0 0 4rpx 4rpx;
}
.shelf-frame {
  width: 66rpx;
  height: 66rpx;
  border: 6rpx solid #2a2825;
  border-radius: 6rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}
.shelf-bar {
  height: 6rpx;
  background: #d9a066;
}
.cab-box {
  width: 74rpx;
  height: 62rpx;
  background: #e6c29f;
  border: 5rpx solid #2a2825;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
}
.cab-drawer {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cab-drawer:first-child {
  border-bottom: 4rpx solid #2a2825;
}
.cab-knob {
  width: 12rpx;
  height: 6rpx;
  border-radius: 4rpx;
  background: #2a2825;
}
.st-name {
  display: block;
  font-size: 26rpx;
  font-weight: 800;
  margin-top: 6rpx;
}
.card-headline {
  font-size: 40rpx;
  font-weight: 900;
  line-height: 1.25;
  margin-bottom: 18rpx;
}
.chk-preview {
  border-top: 2rpx dashed #e6e1d6;
  padding-top: 8rpx;
}
.p-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 12rpx 0;
  border-bottom: 2rpx dashed #e6e1d6;
  font-size: 26rpx;
  font-weight: 600;
}
.p-row:last-child {
  border-bottom: none;
}
.ck {
  width: 40rpx;
  height: 40rpx;
  border-radius: 10rpx;
  background: #1a1917;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 900;
  flex-shrink: 0;
}
.ck.y {
  background: #ffd84d;
  color: #5c4000;
}
.mt {
  margin-top: 20rpx;
}
.exp-entry {
  margin-top: 40rpx;
  text-align: center;
}
</style>
