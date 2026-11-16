<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: number | null
  label: string
  unit?: string
  placeholder?: string
  required?: boolean
  tip?: string
}>()
const emit = defineEmits<{ (e: 'update:modelValue', v: number | null): void }>()

const text = ref(props.modelValue === null ? '' : String(props.modelValue))
watch(
  () => props.modelValue,
  (v) => {
    const cur = text.value.trim() === '' ? null : Number(text.value)
    if (cur !== v) text.value = v === null ? '' : String(v)
  },
)

function onInput(e: any) {
  text.value = e.detail.value
  const s = text.value.trim()
  const n = Number(s)
  emit('update:modelValue', s === '' || Number.isNaN(n) ? null : n)
}

function showTip() {
  uni.showModal({ title: `怎么量：${props.label}`, content: props.tip || '', showCancel: false, confirmText: '知道了' })
}
</script>

<template>
  <view class="nb-row">
    <view class="nb-left">
      <view class="nb-lbl">
        <text>{{ label }}</text>
        <text v-if="required" class="req">必填</text>
      </view>
      <text v-if="tip" class="tip-link" @tap="showTip">怎么量？</text>
    </view>
    <view class="nb-input">
      <input type="digit" :value="text" :placeholder="placeholder || '未填'" @input="onInput" />
      <text v-if="unit" class="unit">{{ unit }}</text>
    </view>
  </view>
</template>

<style scoped>
.nb-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 2rpx dashed #e6e1d6;
  gap: 16rpx;
}
.nb-row:last-child {
  border-bottom: none;
}
.nb-left {
  flex: 1;
}
.nb-lbl {
  font-size: 28rpx;
  font-weight: 700;
  color: #1a1917;
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.req {
  font-size: 20rpx;
  font-weight: 800;
  background: #ffd84d;
  color: #422d00;
  padding: 2rpx 12rpx;
  border-radius: 999rpx;
}
.tip-link {
  font-size: 22rpx;
  font-weight: 700;
  color: #8a6400;
  text-decoration: underline;
}
.nb-input {
  width: 230rpx;
  display: flex;
  align-items: center;
  background: #f7f5ee;
  border-radius: 20rpx;
  height: 72rpx;
  padding: 0 20rpx;
}
.nb-input input {
  flex: 1;
  font-size: 30rpx;
  font-weight: 800;
  height: 72rpx;
  text-align: right;
  color: #1a1917;
}
.unit {
  font-size: 24rpx;
  font-weight: 700;
  color: #6e685c;
  margin-left: 8rpx;
}
</style>
