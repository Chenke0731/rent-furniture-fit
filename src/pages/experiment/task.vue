<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import DecisionCard from '@/components/DecisionCard.vue'
import { SAMPLE_ITEMS } from '@/data/sample'
import { TASKS, groupOf, sequenceFor, type ExperimentTask, type Condition } from '@/data/tasks'
import { checkItem, evaluate } from '@/engine/evaluate'
import type { FurnitureItem } from '@/engine/types'
import { saveRecord } from '@/store/experiment'
import { paramRows } from '@/utils/format'

const participant = ref(0)
const step = ref(0)
const total = ref(0)
const task = ref<ExperimentTask | null>(null)
const condition = ref<Condition>('A')
const candidates = ref<FurnitureItem[]>([])
const phase = ref<'choose' | 'survey'>('choose')
const selectedId = ref('')
const expandCount = ref(0)
const understanding = ref(0)
const satisfaction = ref(0)
let startedAt = new Date()
let durationSec = 0

onLoad((q: any) => {
  participant.value = Number(q.participant)
  step.value = Number(q.step)
  const seq = sequenceFor(participant.value)
  total.value = seq.length
  const cur = seq[step.value]
  task.value = TASKS.find((t) => t.id === cur.taskId)!
  condition.value = cur.condition
  candidates.value = task.value.candidateIds.map((id) => SAMPLE_ITEMS.find((i) => i.id === id)!)
  startedAt = new Date()
})

const results = computed(() => (task.value ? evaluate(task.value.room, candidates.value) : []))

function confirmChoice() {
  if (!selectedId.value) {
    uni.showToast({ title: '请先选择一款', icon: 'none' })
    return
  }
  durationSec = Math.round((Date.now() - startedAt.getTime()) / 100) / 10
  phase.value = 'survey'
}

const QUESTIONS = [
  { key: 'understanding', text: '我清楚所选家具能否放进房间、搬进门并按租赁条件安装' },
  { key: 'satisfaction', text: '我对这次选择过程感到满意' },
] as const

function rate(key: 'understanding' | 'satisfaction', v: number) {
  if (key === 'understanding') understanding.value = v
  else satisfaction.value = v
}

function submit() {
  if (!understanding.value || !satisfaction.value) {
    uni.showToast({ title: '请完成两道评分', icon: 'none' })
    return
  }
  const item = candidates.value.find((i) => i.id === selectedId.value)!
  const status = checkItem(task.value!.room, item).status
  saveRecord({
    participant: participant.value,
    group: groupOf(participant.value),
    step: step.value + 1,
    taskId: task.value!.id,
    condition: condition.value,
    startedAt: startedAt.toISOString(),
    durationSec,
    selectedId: item.id,
    selectedName: item.name,
    selectedStatus: status,
    isError: status === 'conflict',
    expandCount: expandCount.value,
    understanding: understanding.value,
    satisfaction: satisfaction.value,
  })
  if (step.value + 1 < total.value) {
    uni.showModal({
      title: '本任务完成',
      content: '点击确定进入下一个任务。',
      showCancel: false,
      success: () => uni.redirectTo({ url: `/pages/experiment/task?participant=${participant.value}&step=${step.value + 1}` }),
    })
  } else {
    uni.showModal({ title: '全部任务完成', content: '感谢参与。', showCancel: false, success: () => uni.navigateBack() })
  }
}
</script>

<template>
  <view v-if="task" class="page">
    <view class="top-row">
      <text class="pill">参与者 {{ participant }} · 任务 {{ step + 1 }} / {{ total }}</text>
    </view>

    <view class="nb-card tilt-l">
      <view class="tape" />
      <view class="section-title">{{ task.title }}</view>
      <view class="desc">{{ task.description }}</view>
      <view class="muted mt">请从下列商品中选出你会购买的一款。</view>
    </view>

    <template v-if="phase === 'choose'">
      <template v-if="condition === 'A'">
        <view v-for="i in candidates" :key="i.id" class="nb-card" :class="{ on: selectedId === i.id }">
          <view class="name">{{ i.name }}</view>
          <view v-for="row in paramRows(i)" :key="row[0]" class="prow">
            <text class="pk">{{ row[0] }}</text>
            <text>{{ row[1] }}</text>
          </view>
          <button class="pick" :class="{ on: selectedId === i.id }" @tap="selectedId = i.id">
            {{ selectedId === i.id ? '✓ 已选定这一款' : '选这一款' }}
          </button>
        </view>
      </template>
      <template v-else>
        <DecisionCard
          v-for="r in results"
          :key="r.item.id"
          :result="r"
          selectable
          :selected="selectedId === r.item.id"
          @select="selectedId = r.item.id"
          @expand="expandCount++"
        />
      </template>
      <view class="bottom-bar">
        <button class="btn" @tap="confirmChoice">确认选择</button>
      </view>
    </template>

    <view v-else class="nb-card">
      <view class="section-title">请按同意程度评分</view>
      <view class="muted">1 表示非常不同意，5 表示非常同意。</view>
      <view v-for="q in QUESTIONS" :key="q.key" class="q">
        <view class="q-text">{{ q.text }}</view>
        <view class="scale">
          <view
            v-for="v in 5"
            :key="v"
            class="dot"
            :class="{ on: (q.key === 'understanding' ? understanding : satisfaction) === v }"
            @tap="rate(q.key, v)"
            >{{ v }}</view
          >
        </view>
      </view>
      <button class="btn mt" @tap="submit">提交</button>
    </view>
  </view>
</template>

<style scoped>
.top-row {
  margin-bottom: 20rpx;
}
.mt {
  margin-top: 20rpx;
}
.desc {
  font-size: 28rpx;
  color: #2b2925;
}
.nb-card.on {
  box-shadow: 0 0 0 5rpx #1a1917, 0 18rpx 44rpx rgba(60, 45, 20, 0.14);
}
.name {
  font-weight: 900;
  font-size: 32rpx;
  margin-bottom: 12rpx;
}
.prow {
  display: flex;
  font-size: 26rpx;
  padding: 10rpx 0;
  border-bottom: 2rpx dashed #e6e1d6;
}
.pk {
  width: 280rpx;
  color: #6e685c;
}
.pick {
  margin-top: 20rpx;
  font-size: 28rpx;
  font-weight: 800;
  line-height: 80rpx;
  border-radius: 999rpx;
  background: #efece3;
  color: #1a1917;
  border: none;
}
.pick::after { border: none; }
.pick.on {
  background: #1a1917;
  color: #ffffff;
}
.q {
  margin-top: 28rpx;
}
.q-text {
  font-size: 28rpx;
  font-weight: 700;
  margin-bottom: 14rpx;
}
.scale {
  display: flex;
  justify-content: space-between;
}
.dot {
  width: 96rpx;
  height: 96rpx;
  line-height: 96rpx;
  text-align: center;
  border-radius: 50%;
  background: #efece3;
  font-size: 30rpx;
  font-weight: 900;
  color: #1a1917;
}
.dot.on {
  background: #ffd84d;
  color: #1a1917;
}
</style>
