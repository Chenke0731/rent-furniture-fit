import type { FurnitureItem } from '@/engine/types'

/**
 * 示例数据：用于跑通规则与界面，不对应真实商品。
 * 部分条目故意缺少字段，用于展示“信息不足”和“有条件适配”的处理。
 * 正式商品库由数据组人工核验后通过 Excel 导入替换。
 */
const base = {
  source: '示例数据，非真实商品',
  checkedAt: null,
  isSample: true,
  isManual: false,
}

export const SAMPLE_ITEMS: FurnitureItem[] = [
  // 书桌
  { ...base, id: 'D1', name: '示例书桌 A（120 宽）', category: 'desk', price: 499, extraFee: 30, width: 120, depth: 60, height: 75, packageMinSide: 14, operationDepth: 70, needsDrill: false, assembly: 'tool', weight: 22 },
  { ...base, id: 'D2', name: '示例书桌 B（100 宽）', category: 'desk', price: 399, extraFee: 30, width: 100, depth: 50, height: 75, packageMinSide: 15, operationDepth: 70, needsDrill: false, assembly: 'tool', weight: 18 },
  { ...base, id: 'D3', name: '示例折叠书桌 C', category: 'desk', price: 459, extraFee: 0, width: 100, depth: 60, height: 74, packageMinSide: null, operationDepth: 75, needsDrill: false, assembly: 'toolfree', weight: 15 },
  { ...base, id: 'D4', name: '示例整装书桌 D', category: 'desk', price: 329, extraFee: 40, width: 100, depth: 55, height: 76, packageMinSide: null, operationDepth: 70, needsDrill: false, assembly: 'assembled', weight: 20 },
  { ...base, id: 'D5', name: '示例书桌 E（加深款）', category: 'desk', price: 559, extraFee: 60, width: 100, depth: 70, height: 75, packageMinSide: 16, operationDepth: 70, needsDrill: false, assembly: 'tool', weight: 26 },
  // 置物架
  { ...base, id: 'S1', name: '示例壁挂置物架 A', category: 'shelf', price: 159, extraFee: 0, width: 60, depth: 30, height: 170, packageMinSide: 10, operationDepth: null, needsDrill: true, assembly: 'tool', weight: 9 },
  { ...base, id: 'S2', name: '示例落地置物架 B', category: 'shelf', price: 259, extraFee: 0, width: 78, depth: 35, height: 180, packageMinSide: 12, operationDepth: null, needsDrill: false, assembly: 'toolfree', weight: 12 },
  { ...base, id: 'S3', name: '示例置物架 C', category: 'shelf', price: 199, extraFee: 20, width: 70, depth: 40, height: 160, packageMinSide: 11, operationDepth: null, needsDrill: null, assembly: 'tool', weight: 10 },
  // 收纳柜
  { ...base, id: 'C1', name: '示例整装收纳柜 A', category: 'cabinet', price: 289, extraFee: 50, width: 75, depth: 40, height: 100, packageMinSide: null, operationDepth: 35, needsDrill: false, assembly: 'assembled', weight: 30 },
  { ...base, id: 'C2', name: '示例抽屉柜 B', category: 'cabinet', price: 329, extraFee: 50, width: 60, depth: 38, height: 90, packageMinSide: 16, operationDepth: 40, needsDrill: false, assembly: 'tool', weight: 25 },
  { ...base, id: 'C3', name: '示例宽体收纳柜 C', category: 'cabinet', price: 269, extraFee: 40, width: 85, depth: 40, height: 80, packageMinSide: 15, operationDepth: 40, needsDrill: false, assembly: 'tool', weight: 24 },
]
