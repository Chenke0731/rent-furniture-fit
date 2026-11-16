<script setup lang="ts">
import { reactive } from 'vue'
import NumField from '@/components/NumField.vue'
import { state } from '@/store'
import type { DrillPolicy, LeaseTerm, RoomProfile } from '@/engine/types'

const form = reactive<RoomProfile>(JSON.parse(JSON.stringify(state.profile)))

const TIPS = {
  width: '量家具要放的位置两侧障碍物之间最窄处。扣除踢脚线、插座面板、暖气片、窗帘等凸出部分；墙角不是直角时量最窄处。',
  depth: '从家具要靠的墙面，量到对面最近的障碍物（床沿、柜子、墙）。这个距离要同时容纳家具本身和前方的通行或使用空间。',
  height: '上方有窗台、吊柜、斜顶或空调时，量其下沿到地面的距离。没有限制就留空。',
  door: '沿搬运路线找最窄处：房门、入户门、楼道转角、电梯门。量门框内侧净宽；门扇只能开到 90 度时，还要扣除门扇厚度和合页凸出。',
  clearance: '家具放好后，前方至少要留出多宽才能正常走动或坐下。按自己的习惯填写，不确定可以先在原地用卷尺比一比。',
}

const LEASE: { v: LeaseTerm; t: string }[] = [
  { v: 'lt6', t: '不足 6 个月' },
  { v: '6to12', t: '6—12 个月' },
  { v: 'gt12', t: '1 年以上' },
]
const DRILL: { v: DrillPolicy; t: string }[] = [
  { v: 'allowed', t: '允许打孔' },
  { v: 'forbidden', t: '不允许' },
  { v: 'unknown', t: '还没问' },
]
const WEIGHTS: { k: keyof RoomProfile['weights']; t: string; d: string }[] = [
  { k: 'cost', t: '总成本', d: '商品价加运费安装费' },
  { k: 'moving', t: '拆装搬迁', d: '拆装方式与重量' },
  { k: 'function', t: '功能大小', d: '桌面面积或收纳容积' },
]

function setWeight(k: keyof RoomProfile['weights'], e: any) {
  form.weights[k] = Number(e.detail.value)
}

function fillDemo() {
  form.spaceWidth = 110
  form.spaceDepth = 150
  form.spaceHeight = null
  form.doorWidth = 80
  form.clearance = 60
  form.budget = 600
  form.drill = 'forbidden'
  form.leaseTerm = '6to12'
}

function save() {
  const lacks: string[] = []
  if (form.spaceWidth === null) lacks.push('可用宽度')
  if (form.spaceDepth === null) lacks.push('放置纵深')
  if (form.doorWidth === null) lacks.push('最窄门宽')
  if (lacks.length) {
    uni.showModal({
      title: '还缺必填尺寸',
      content: `请先测量并填写：${lacks.join('、')}。只填房间面积无法判断家具能否放下。`,
      showCancel: false,
    })
    return
  }
  Object.assign(state.profile, JSON.parse(JSON.stringify(form)))
  state.profileSaved = true
  uni.redirectTo({ url: '/pages/products/products' })
}
</script>

<template>
  <view class="page">
    <view class="top-row">
      <text class="pill">第 1 步 · 量角落</text>
      <text class="pill-light" @tap="fillDemo">填入示例尺寸 (110×150)</text>
    </view>

    <view class="headline">
      拿卷尺量好<text class="hl">具体位置</text>，只填几平米算不出能不能放
    </view>

    <!-- 手账贴纸式房间平面示意卡（纯 view + CSS，兼容微信小程序） -->
    <view class="nb-card tilt-r">
      <view class="tape" />
      <view class="plan-box">
        <view class="plan-room">
          <view class="plan-furn">
            <text class="pf-main">可用宽 {{ form.spaceWidth ?? '?' }} cm</text>
            <text class="pf-sub">扣踢脚线与插座</text>
          </view>
          <view class="plan-clear">
            前方留空 ≥ {{ form.clearance ?? '?' }} cm（总纵深 {{ form.spaceDepth ?? '?' }} cm）
          </view>
        </view>
        <view class="plan-door">
          <text class="pd-lbl">最窄门框净宽</text>
          <text class="pd-val">{{ form.doorWidth ?? '?' }} cm</text>
          <text class="pd-sub">限高：{{ form.spaceHeight ? `${form.spaceHeight} cm` : '不限' }}</text>
        </view>
      </view>

      <NumField v-model="form.spaceWidth" label="放置位置可用宽度" unit="cm" required :tip="TIPS.width" />
      <NumField v-model="form.spaceDepth" label="放置纵深（墙到对面床或柜）" unit="cm" required :tip="TIPS.depth" />
      <NumField v-model="form.spaceHeight" label="上方限高" unit="cm" placeholder="不限可留空" :tip="TIPS.height" />
      <NumField v-model="form.clearance" label="前方需留出的通行宽度" unit="cm" placeholder="可留空" :tip="TIPS.clearance" />
      <NumField v-model="form.doorWidth" label="搬运路线最窄门或通道净宽" unit="cm" required :tip="TIPS.door" />
    </view>

    <view class="nb-card">
      <view class="section-title">租房限制与预算</view>
      <view class="sub-lbl">房东是否允许在墙上打孔</view>
      <view class="seg">
        <view v-for="o in DRILL" :key="o.v" class="seg-item" :class="{ active: form.drill === o.v }" @tap="form.drill = o.v">{{ o.t }}</view>
      </view>
      <view class="sub-lbl">预计还会住多久</view>
      <view class="seg">
        <view v-for="o in LEASE" :key="o.v" class="seg-item" :class="{ active: form.leaseTerm === o.v }" @tap="form.leaseTerm = o.v">{{ o.t }}</view>
      </view>
      <NumField v-model="form.budget" label="单件含运费预算上限" unit="元" placeholder="不限可留空" />
    </view>

    <view class="nb-card">
      <view class="section-title">比较时更看重什么</view>
      <view class="muted">只影响能放下的家具之间的排序，不会把放不下的家具排进来。</view>
      <view v-for="w in WEIGHTS" :key="w.k" class="w-row">
        <view class="w-lbl">
          <text class="w-t">{{ w.t }}</text>
          <text class="muted"> · {{ w.d }}</text>
        </view>
        <slider
          :value="form.weights[w.k]"
          :min="1"
          :max="5"
          :step="1"
          show-value
          activeColor="#1A1917"
          backgroundColor="#E6E1D6"
          block-color="#FFD84D"
          block-size="22"
          @change="setWeight(w.k, $event)"
        />
      </view>
    </view>

    <view class="bottom-bar">
      <button class="btn" @tap="save">记进本子 · 去挑候选家具</button>
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
.headline {
  font-size: 38rpx;
  font-weight: 900;
  line-height: 1.3;
  margin-bottom: 28rpx;
}
.plan-box {
  display: flex;
  gap: 16rpx;
  margin-bottom: 18rpx;
}
.plan-room {
  flex: 1.35;
  background: #f7f5ee;
  border: 4rpx solid #1a1917;
  border-radius: 20rpx;
  padding: 14rpx;
}
.plan-furn {
  background: #ffd84d;
  border-radius: 12rpx;
  padding: 10rpx 14rpx;
}
.pf-main {
  display: block;
  font-size: 24rpx;
  font-weight: 900;
  color: #1a1917;
}
.pf-sub {
  display: block;
  font-size: 20rpx;
  font-weight: 700;
  color: #5c4000;
}
.plan-clear {
  margin-top: 12rpx;
  font-size: 20rpx;
  font-weight: 800;
  color: #1a1917;
}
.plan-door {
  flex: 1;
  background: #f7f5ee;
  border: 4rpx solid #1a1917;
  border-radius: 20rpx;
  padding: 14rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.pd-lbl {
  font-size: 20rpx;
  font-weight: 800;
  color: #6e685c;
}
.pd-val {
  font-size: 38rpx;
  font-weight: 900;
  color: #1a1917;
}
.pd-sub {
  font-size: 20rpx;
  font-weight: 700;
  color: #6e685c;
}
.sub-lbl {
  font-size: 26rpx;
  font-weight: 800;
  color: #4a463e;
  margin: 22rpx 0 12rpx;
}
.w-row {
  margin-top: 20rpx;
  padding-top: 14rpx;
  border-top: 2rpx dashed #e6e1d6;
}
.w-t {
  font-weight: 800;
  font-size: 28rpx;
}
</style>
