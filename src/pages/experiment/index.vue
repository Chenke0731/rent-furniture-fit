<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { TASKS, groupOf, sequenceFor } from '@/data/tasks'
import { clearRecords, loadRecords, toCsv, type ExperimentRecord } from '@/store/experiment'

const no = ref('')
const records = ref<ExperimentRecord[]>([])
onShow(() => (records.value = loadRecords()))

const n = computed(() => {
  const v = Number(no.value)
  return Number.isInteger(v) && v > 0 ? v : null
})
const seq = computed(() => (n.value ? sequenceFor(n.value) : []))
const taskTitle = (id: string) => TASKS.find((t) => t.id === id)!.title
const COND = { A: '普通商品列表', B: '适配审核单' }

const participants = computed(() => new Set(records.value.map((r) => r.participant)).size)
const done = computed(() => (n.value ? records.value.filter((r) => r.participant === n.value).length : 0))

function start() {
  if (!n.value) {
    uni.showToast({ title: '请输入正整数编号', icon: 'none' })
    return
  }
  const begin = () => uni.navigateTo({ url: `/pages/experiment/task?participant=${n.value}&step=0` })
  if (done.value) {
    uni.showModal({ title: '该编号已有记录', content: '重新开始会覆盖该编号的记录，是否继续？', success: (r) => r.confirm && begin() })
  } else begin()
}

function exportCsv() {
  if (!records.value.length) {
    uni.showToast({ title: '还没有记录', icon: 'none' })
    return
  }
  const csv = toCsv(records.value)
  // #ifdef H5
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `experiment_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
  // #endif
  // #ifndef H5
  uni.setClipboardData({ data: csv, success: () => uni.showToast({ title: 'CSV 已复制到剪贴板', icon: 'none' }) })
  // #endif
}

function clearAll() {
  uni.showModal({
    title: '清空全部实验记录？',
    content: '清空后无法恢复，请先导出。',
    success: (r) => {
      if (r.confirm) {
        clearRecords()
        records.value = []
      }
    },
  })
}
</script>

<template>
  <view class="page">
    <view class="nb-card tilt-l">
      <view class="tape" />
      <view class="section-title">开始一位参与者</view>
      <view class="muted">编号从 1 开始连续分配。系统按编号自动分到 4 个顺序组，平衡两种条件的先后和任务搭配。</view>
      <input v-model="no" type="number" class="txt" placeholder="参与者编号" />
      <view v-if="n" class="seq-box">
        <view class="muted">第 {{ groupOf(n) }} 组，任务顺序：</view>
        <view v-for="(s, i) in seq" :key="i" class="seq-row">{{ i + 1 }}. {{ taskTitle(s.taskId) }} — {{ COND[s.condition] }}</view>
      </view>
      <button class="btn mt" @tap="start">开始任务</button>
    </view>

    <view class="stat-pair">
      <view class="stat-y">
        <text class="st-num">{{ participants }} 人</text>
        <text class="st-lbl">已完成参与者</text>
      </view>
      <view class="stat-g">
        <text class="st-num">{{ records.length }} 条</text>
        <text class="st-lbl">任务记录</text>
      </view>
    </view>

    <view class="nb-card">
      <view class="section-title">导出数据</view>
      <view class="muted">字段：编号、组别、顺序、任务、条件、开始时间、用时（秒）、所选商品及其判断状态、是否错误选择、展开详情次数、理解度、满意度。</view>
      <view class="row mt">
        <button class="btn yellow" @tap="exportCsv">导出 CSV</button>
        <button class="btn-ghost danger" @tap="clearAll">清空记录</button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.txt {
  background: #f7f5ee;
  border-radius: 20rpx;
  padding: 0 22rpx;
  height: 78rpx;
  font-size: 30rpx;
  font-weight: 800;
  margin-top: 20rpx;
}
.seq-box {
  margin-top: 16rpx;
  background: #fff9db;
  border-radius: 20rpx;
  padding: 18rpx 20rpx;
}
.seq-row {
  font-size: 26rpx;
  font-weight: 700;
  margin-top: 6rpx;
}
.stat-pair {
  display: flex;
  gap: 18rpx;
  margin-bottom: 28rpx;
}
.stat-y {
  flex: 1.1;
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
  font-size: 48rpx;
  font-weight: 900;
  line-height: 1;
}
.st-lbl {
  display: block;
  font-size: 24rpx;
  font-weight: 800;
  margin-top: 8rpx;
}
.mt {
  margin-top: 24rpx;
}
.row {
  display: flex;
  gap: 20rpx;
}
.row button {
  flex: 1;
}
.danger {
  color: #b91c1c;
}
</style>
