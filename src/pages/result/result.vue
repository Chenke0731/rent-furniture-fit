<script setup lang="ts">
import { computed } from 'vue'
import DecisionCard from '@/components/DecisionCard.vue'
import { evaluate } from '@/engine/evaluate'
import { selectedItems, state } from '@/store'

const results = computed(() => evaluate(state.profile, selectedItems.value))
const eligible = computed(() => results.value.filter((r) => r.status === 'fit' || r.status === 'conditional'))
const conflicts = computed(() => results.value.filter((r) => r.status === 'conflict'))
const insufficient = computed(() => results.value.filter((r) => r.status === 'insufficient'))

const p = state.profile
const DRILL = { allowed: '允许打孔', forbidden: '禁打孔', unknown: '打孔待问' }
const LEASE = { lt6: '租期<6月', '6to12': '租期6—12月', gt12: '租期>1年' }

const go = (url: string) => uni.redirectTo({ url })
</script>

<template>
  <view class="page">
    <view class="top-row">
      <text class="pill">第 3 步 · 审核单</text>
      <text class="stamp-mini">{{ DRILL[p.drill] }} · 门宽 {{ p.doorWidth }}cm</text>
    </view>

    <view class="headline">
      <text class="hl">硬条件全过</text>，才进入偏好比较
    </view>
    <view class="muted sub-cond">
      角落净宽 {{ p.spaceWidth }}cm × 纵深 {{ p.spaceDepth }}cm
      <text v-if="p.clearance !== null"> · 前方留空 {{ p.clearance }}cm</text>
      <text v-if="p.budget !== null"> · 预算 {{ p.budget }}元</text>
      · {{ LEASE[p.leaseTerm] }}
    </view>

    <!-- 双色统计块 -->
    <view class="stat-pair">
      <view class="stat-y">
        <text class="st-num">{{ eligible.length }} 款</text>
        <text class="st-lbl">过了硬条件可选</text>
      </view>
      <view class="stat-g">
        <text class="st-num">{{ conflicts.length + insufficient.length }} 款</text>
        <text class="st-lbl">冲突或信息不足</text>
      </view>
    </view>

    <view class="sec-head">
      <text class="pill">可选候选（{{ eligible.length }}）</text>
      <text class="muted">按总成本、搬迁与功能大小排序</text>
    </view>
    <view v-if="!eligible.length" class="nb-card">
      <view class="muted">没有同时满足全部硬条件的商品。请查看下方未通过原因，或补充缺失尺寸后再核对。</view>
    </view>
    <DecisionCard v-for="r in eligible" :key="r.item.id" :result="r" />

    <template v-if="conflicts.length">
      <view class="sec-head">
        <text class="pill-light">冲突排除（{{ conflicts.length }}）</text>
        <text class="muted">放不下、搬不进或违反租房限制</text>
      </view>
      <DecisionCard v-for="r in conflicts" :key="r.item.id" :result="r" />
    </template>

    <template v-if="insufficient.length">
      <view class="sec-head">
        <text class="pill-light">信息不足（{{ insufficient.length }}）</text>
        <text class="muted">缺关键尺寸，向客服问清后可补录</text>
      </view>
      <DecisionCard v-for="r in insufficient" :key="r.item.id" :result="r" />
    </template>

    <view class="bottom-bar">
      <button class="btn-ghost" @tap="go('/pages/profile/profile')">改角落尺寸</button>
      <button class="btn" @tap="go('/pages/products/products')">换候选家具</button>
    </view>
  </view>
</template>

<style scoped>
.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14rpx;
}
.stamp-mini {
  background: #fff5c0;
  border: 2rpx solid #946800;
  color: #7a5400;
  font-size: 22rpx;
  font-weight: 800;
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
  transform: rotate(-3deg);
}
.headline {
  font-size: 44rpx;
  font-weight: 900;
  line-height: 1.2;
}
.sub-cond {
  margin: 10rpx 0 24rpx;
}
.stat-pair {
  display: flex;
  gap: 18rpx;
  margin-bottom: 32rpx;
}
.stat-y {
  flex: 1.15;
  background: #ffd84d;
  border-radius: 30rpx;
  padding: 24rpx 28rpx;
  color: #422d00;
}
.stat-g {
  flex: 1;
  background: #efece3;
  border: 3rpx solid #dfd9ca;
  border-radius: 30rpx;
  padding: 24rpx 28rpx;
  color: #4a463e;
}
.st-num {
  display: block;
  font-size: 52rpx;
  font-weight: 900;
  line-height: 1;
}
.st-lbl {
  display: block;
  font-size: 24rpx;
  font-weight: 800;
  margin-top: 8rpx;
}
.sec-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 28rpx 0 18rpx;
}
</style>
