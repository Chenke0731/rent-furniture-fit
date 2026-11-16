<script setup lang="ts">
import { computed, ref } from 'vue'
import { allItems, state, toggleSelect, removeManualItem, MAX_SELECT, MIN_SELECT } from '@/store'
import { sizeText } from '@/utils/format'
import { assemblyName, categoryName } from '@/engine/evaluate'
import type { Category } from '@/engine/types'

const TABS: { v: Category | 'all'; t: string }[] = [
  { v: 'all', t: '全部' },
  { v: 'desk', t: '书桌' },
  { v: 'shelf', t: '置物架' },
  { v: 'cabinet', t: '收纳柜' },
]
const tab = ref<Category | 'all'>('all')
const list = computed(() => (tab.value === 'all' ? allItems.value : allItems.value.filter((i) => i.category === tab.value)))
const count = computed(() => state.selectedIds.length)

function tapItem(id: string) {
  if (!toggleSelect(id)) uni.showToast({ title: `最多选 ${MAX_SELECT} 款`, icon: 'none' })
}
function remove(id: string) {
  uni.showModal({
    title: '删除这张手动贴入的商品？',
    success: (r) => r.confirm && removeManualItem(id),
  })
}
const go = (url: string) => uni.navigateTo({ url })
</script>

<template>
  <view class="page">
    <view class="top-row">
      <text class="pill">第 2 步 · 挑候选</text>
      <text class="muted">勾选 2—5 款放进审核单对比</text>
    </view>

    <view class="filter-pills">
      <view
        v-for="t in TABS"
        :key="t.v"
        :class="tab === t.v ? 'pill' : 'pill-light'"
        @tap="tab = t.v"
      >
        {{ t.t }}
      </view>
    </view>

    <view class="manual-sticker" @tap="go('/pages/manual/manual')">
      <view class="tape" />
      <view class="m-title">＋ 手动贴入一款看中的家具</view>
      <view class="muted">对照商品详情页填写，商家没写的尺寸留空即可</view>
    </view>

    <view
      v-for="i in list"
      :key="i.id"
      class="item-card"
      :class="{ on: state.selectedIds.includes(i.id) }"
      @tap="tapItem(i.id)"
    >
      <view class="ck" :class="{ on: state.selectedIds.includes(i.id) }">
        {{ state.selectedIds.includes(i.id) ? '✓' : '' }}
      </view>
      <view class="body">
        <view class="r1">
          <text class="name">{{ i.name }}</text>
          <text class="price">{{ i.price === null ? '价格未披露' : `¥${i.price}` }}</text>
        </view>
        <view class="muted">{{ categoryName(i.category) }} · {{ sizeText(i) }} · {{ assemblyName(i.assembly) }}</view>
        <view class="tags-row">
          <text v-if="i.isSample" class="tag tag-sample">示例数据</text>
          <text v-if="i.isManual" class="tag tag-manual">手动贴入</text>
          <text v-if="i.packageMinSide === null" class="tag tag-sample">未标包装尺寸</text>
          <text v-if="i.isManual" class="del" @tap.stop="remove(i.id)">删除</text>
        </view>
      </view>
    </view>

    <view class="bottom-bar">
      <view class="pill-light">已选 {{ count }} / {{ MAX_SELECT }}</view>
      <button class="btn" :disabled="count < MIN_SELECT" @tap="go('/pages/result/result')">
        {{ count < MIN_SELECT ? `再选 ${MIN_SELECT - count} 款即可对比` : '看适配审核单' }}
      </button>
    </view>
  </view>
</template>

<style scoped>
.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.filter-pills {
  display: flex;
  gap: 14rpx;
  margin-bottom: 28rpx;
  flex-wrap: wrap;
}
.manual-sticker {
  background: #fff9db;
  border-radius: 32rpx;
  padding: 26rpx 28rpx;
  margin-bottom: 26rpx;
  position: relative;
  box-shadow: 0 10rpx 26rpx rgba(60, 45, 20, 0.08);
}
.m-title {
  font-size: 30rpx;
  font-weight: 900;
  color: #422d00;
}
.item-card {
  background: #ffffff;
  border-radius: 32rpx;
  padding: 26rpx;
  margin-bottom: 20rpx;
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
  box-shadow: 0 10rpx 26rpx rgba(60, 45, 20, 0.07);
}
.item-card.on {
  box-shadow: 0 0 0 5rpx #1a1917, 0 14rpx 32rpx rgba(60, 45, 20, 0.12);
}
.ck {
  width: 46rpx;
  height: 46rpx;
  border-radius: 14rpx;
  background: #efece3;
  color: #1a1917;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 900;
  flex-shrink: 0;
  margin-top: 4rpx;
}
.ck.on {
  background: #1a1917;
  color: #ffffff;
}
.body {
  flex: 1;
}
.r1 {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12rpx;
  margin-bottom: 4rpx;
}
.name {
  font-size: 30rpx;
  font-weight: 900;
}
.price {
  font-size: 30rpx;
  font-weight: 900;
  color: #1a1917;
  background: #ffd84d;
  padding: 2rpx 14rpx;
  border-radius: 999rpx;
}
.tags-row {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6rpx;
}
.del {
  font-size: 22rpx;
  font-weight: 700;
  color: #b91c1c;
  margin-left: 10rpx;
}
</style>
