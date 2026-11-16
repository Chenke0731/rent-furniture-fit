<script setup lang="ts">
import { ref } from 'vue'
import type { DecisionResult } from '@/engine/types'
import { assemblyName, categoryName } from '@/engine/evaluate'
import { STATUS_TEXT, sizeText } from '@/utils/format'

const props = defineProps<{ result: DecisionResult; selectable?: boolean; selected?: boolean; showTape?: boolean }>()
const emit = defineEmits<{ (e: 'select'): void; (e: 'expand'): void }>()

const showPassed = ref(false)
function togglePassed() {
  showPassed.value = !showPassed.value
  if (showPassed.value) emit('expand')
}
function copyChecklist() {
  const lines = [
    ...props.result.missing.map((m) => `- ${m.text}`),
    ...props.result.warnings.map((w) => `- ${w.text}`),
  ]
  if (!lines.length) return
  const content = `购买前请向客服或房东确认【${props.result.item.name}】：\n${lines.join('\n')}`
  uni.setClipboardData({
    data: content,
    success: () => uni.showToast({ title: '已复制待确认清单', icon: 'none' }),
  })
}
const pct = (n: number) => `${Math.round(n * 100)}%`
</script>

<template>
  <view class="nb-card" :class="{ selected }">
    <view v-if="showTape || result.rank === 1" class="tape" />

    <!-- 审核单头部：左侧商品与参数，右侧圆环过线章 -->
    <view class="audit-head">
      <view class="head-left">
        <view class="pills">
          <text v-if="result.rank" class="pill">第 {{ result.rank }} 名</text>
          <text class="pill-tag">{{ categoryName(result.item.category) }}</text>
        </view>
        <view class="name">{{ result.item.name }}</view>
        <view class="muted">
          {{ sizeText(result.item) }}
          <text v-if="result.totalCost !== null"> · 含费约 {{ result.totalCost }} 元</text>
          <text> · {{ assemblyName(result.item.assembly) }}</text>
        </view>
      </view>

      <view class="ring" :class="'ring-' + result.status">
        <text class="ring-main">{{ result.score ? Math.round(result.score.total) : STATUS_TEXT[result.status].slice(0, 2) }}</text>
        <text class="ring-sub">{{ STATUS_TEXT[result.status] }}</text>
      </view>
    </view>

    <!-- 逐项打勾/挑错清单 -->
    <view class="check-list">
      <view v-for="c in result.conflicts" :key="c.key" class="chk-row">
        <text class="ck ck-err">×</text>
        <text class="chk-txt err-txt">{{ c.text }}</text>
      </view>
      <view v-for="c in result.missing" :key="c.key" class="chk-row">
        <text class="ck ck-null">?</text>
        <text class="chk-txt">{{ c.text }}</text>
      </view>
      <view v-for="c in result.warnings" :key="c.key" class="chk-row">
        <text class="ck ck-warn">!</text>
        <text class="chk-txt warn-txt">{{ c.text }}</text>
      </view>

      <template v-if="result.score">
        <view v-for="h in result.score.highlights" :key="h" class="chk-row">
          <text class="ck ck-good">★</text>
          <text class="chk-txt">优势：{{ h }}</text>
        </view>
        <view v-for="d in result.score.drawbacks" :key="d" class="chk-row">
          <text class="ck ck-null">·</text>
          <text class="chk-txt muted">不足：{{ d }}</text>
        </view>
      </template>

      <template v-if="result.passed.length">
        <template v-if="showPassed || (!result.conflicts.length && !result.missing.length && !result.warnings.length)">
          <view v-for="c in result.passed" :key="c.key" class="chk-row">
            <text class="ck">✓</text>
            <text class="chk-txt">{{ c.text }}</text>
          </view>
        </template>
        <view v-if="result.conflicts.length || result.missing.length || result.warnings.length" class="expand-link" @tap="togglePassed">
          {{ showPassed ? '收起已满足条件' : `查看已满足的 ${result.passed.length} 项硬条件 ⌄` }}
        </view>
      </template>
    </view>

    <!-- 偏好分项小胶囊 -->
    <view v-if="result.score" class="mini-bars">
      <view class="m-chip">成本 {{ pct(result.score.cost) }}</view>
      <view class="m-chip">搬迁 {{ pct(result.score.moving) }}</view>
      <view class="m-chip">功能 {{ pct(result.score.function) }}</view>
    </view>

    <view class="foot-row">
      <text class="src muted">来源：{{ result.item.source }}</text>
      <text
        v-if="result.missing.length || result.warnings.length"
        class="copy-btn"
        @tap="copyChecklist"
      >
        复制待确认清单
      </text>
    </view>

    <button v-if="selectable" class="pick-btn" :class="{ on: selected }" @tap="emit('select')">
      {{ selected ? '✓ 已选定这一款' : '选这一款' }}
    </button>
  </view>
</template>

<style scoped>
.nb-card.selected {
  box-shadow: 0 0 0 6rpx #1a1917, 0 18rpx 44rpx rgba(60, 45, 20, 0.14);
}
.audit-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20rpx;
  margin-bottom: 16rpx;
}
.head-left {
  flex: 1;
}
.pills {
  display: flex;
  gap: 10rpx;
  align-items: center;
  margin-bottom: 8rpx;
}
.pill-tag {
  display: inline-flex;
  align-items: center;
  height: 44rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: #efece3;
  color: #4a463e;
  font-size: 22rpx;
  font-weight: 700;
}
.name {
  font-size: 34rpx;
  font-weight: 900;
  line-height: 1.3;
  margin-bottom: 6rpx;
}
.ring {
  width: 116rpx;
  height: 116rpx;
  border-radius: 50%;
  border: 10rpx solid #e9a800;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #fffdf7;
}
.ring-fit { border-color: #16a34a; }
.ring-conditional { border-color: #e9a800; }
.ring-conflict { border-color: #dc2626; }
.ring-insufficient { border-color: #9ca3af; }
.ring-main {
  font-size: 34rpx;
  font-weight: 900;
  line-height: 1;
  color: #1a1917;
}
.ring-sub {
  font-size: 20rpx;
  font-weight: 800;
  color: #6e685c;
  margin-top: 4rpx;
}
.check-list {
  border-top: 2rpx dashed #e6e1d6;
  padding-top: 8rpx;
}
.chk-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 14rpx 0;
  border-bottom: 2rpx dashed #e6e1d6;
}
.chk-row:last-child {
  border-bottom: none;
}
.ck {
  width: 42rpx;
  height: 42rpx;
  border-radius: 12rpx;
  background: #1a1917;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 900;
  flex-shrink: 0;
  margin-top: 2rpx;
}
.ck-warn { background: #ffd84d; color: #5c4000; }
.ck-err { background: #ef4444; color: #ffffff; }
.ck-null { background: #e5e0d4; color: #4a463e; }
.ck-good { background: #ffd84d; color: #1a1917; }
.chk-txt {
  flex: 1;
  font-size: 26rpx;
  font-weight: 600;
  color: #262420;
}
.err-txt { color: #b91c1c; font-weight: 800; }
.warn-txt { color: #7a5400; font-weight: 700; }
.expand-link {
  padding-top: 12rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: #7a5400;
}
.mini-bars {
  margin-top: 16rpx;
  display: flex;
  gap: 12rpx;
}
.m-chip {
  flex: 1;
  background: #f7f5ee;
  border-radius: 16rpx;
  padding: 10rpx 0;
  text-align: center;
  font-size: 22rpx;
  font-weight: 700;
  color: #4a463e;
}
.foot-row {
  margin-top: 14rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12rpx;
}
.src {
  font-size: 22rpx;
}
.copy-btn {
  font-size: 22rpx;
  font-weight: 800;
  color: #7a5400;
  background: #fff5c0;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
}
.pick-btn {
  margin-top: 20rpx;
  line-height: 80rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 800;
  background: #efece3;
  color: #1a1917;
  border: none;
}
.pick-btn::after { border: none; }
.pick-btn.on {
  background: #1a1917;
  color: #ffffff;
}
</style>
