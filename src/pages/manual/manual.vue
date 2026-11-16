<script setup lang="ts">
import { reactive, ref } from 'vue'
import NumField from '@/components/NumField.vue'
import { addManualItem } from '@/store'
import type { Assembly, Category, FurnitureItem } from '@/engine/types'

const name = ref('')
const category = ref<Category>('desk')
const drill = ref<'yes' | 'no' | 'unknown'>('unknown')
const assembly = ref<Assembly | 'unknown'>('unknown')
const nums = reactive({
  price: null as number | null,
  extraFee: null as number | null,
  width: null as number | null,
  depth: null as number | null,
  height: null as number | null,
  packageMinSide: null as number | null,
  operationDepth: null as number | null,
  weight: null as number | null,
})

const CATS: { v: Category; t: string }[] = [
  { v: 'desk', t: '书桌' },
  { v: 'shelf', t: '置物架' },
  { v: 'cabinet', t: '收纳柜' },
]
const DRILL = [
  { v: 'yes', t: '需要' },
  { v: 'no', t: '不需要' },
  { v: 'unknown', t: '未披露' },
] as const
const ASM = [
  { v: 'assembled', t: '整装' },
  { v: 'tool', t: '需工具' },
  { v: 'toolfree', t: '免工具' },
  { v: 'unknown', t: '未披露' },
] as const

function save() {
  if (!name.value.trim()) {
    uni.showToast({ title: '请填写商品名称', icon: 'none' })
    return
  }
  const item: FurnitureItem = {
    id: `M${Date.now().toString().slice(-4)}`,
    name: name.value.trim(),
    category: category.value,
    ...nums,
    needsDrill: drill.value === 'unknown' ? null : drill.value === 'yes',
    assembly: assembly.value === 'unknown' ? null : assembly.value,
    source: '手动贴入',
    checkedAt: new Date().toISOString().slice(0, 10),
    isSample: false,
    isManual: true,
  }
  addManualItem(item)
  uni.navigateBack()
}
</script>

<template>
  <view class="page">
    <view class="nb-card tilt-l">
      <view class="tape" />
      <view class="section-title">贴入一款看中的商品</view>
      <view class="muted">详情页没有写的参数请留空，审核单会按“未披露”标出并提醒你买前向客服确认。</view>
      <view class="sub">商品名称</view>
      <input v-model="name" class="txt" placeholder="例如：某品牌 100cm 书桌" />
      <view class="sub">品类</view>
      <view class="seg">
        <view v-for="o in CATS" :key="o.v" class="seg-item" :class="{ active: category === o.v }" @tap="category = o.v">{{ o.t }}</view>
      </view>
    </view>

    <view class="nb-card">
      <view class="section-title">尺寸参数</view>
      <NumField v-model="nums.width" label="宽度" unit="cm" />
      <NumField v-model="nums.depth" label="深度" unit="cm" />
      <NumField v-model="nums.height" label="高度" unit="cm" />
      <NumField v-model="nums.packageMinSide" label="外包装最短边" unit="cm" />
      <NumField v-model="nums.operationDepth" label="使用时前方所需空间（拉椅子、开抽屉）" unit="cm" />
    </view>

    <view class="nb-card">
      <view class="section-title">费用与安装</view>
      <NumField v-model="nums.price" label="价格" unit="元" />
      <NumField v-model="nums.extraFee" label="运费和安装费合计" unit="元" />
      <NumField v-model="nums.weight" label="重量" unit="kg" />
      <view class="sub">是否需要打孔固定</view>
      <view class="seg">
        <view v-for="o in DRILL" :key="o.v" class="seg-item" :class="{ active: drill === o.v }" @tap="drill = o.v">{{ o.t }}</view>
      </view>
      <view class="sub">拆装方式</view>
      <view class="seg">
        <view v-for="o in ASM" :key="o.v" class="seg-item" :class="{ active: assembly === o.v }" @tap="assembly = o.v">{{ o.t }}</view>
      </view>
    </view>

    <view class="bottom-bar">
      <button class="btn" @tap="save">贴进候选本</button>
    </view>
  </view>
</template>

<style scoped>
.sub {
  font-size: 26rpx;
  font-weight: 800;
  color: #4a463e;
  margin: 22rpx 0 12rpx;
}
.txt {
  background: #f7f5ee;
  border-radius: 20rpx;
  padding: 0 22rpx;
  height: 76rpx;
  font-size: 28rpx;
  font-weight: 700;
}
</style>
