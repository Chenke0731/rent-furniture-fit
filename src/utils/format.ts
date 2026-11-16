import type { FurnitureItem, Status } from '@/engine/types'
import { assemblyName, categoryName } from '@/engine/evaluate'

export const STATUS_TEXT: Record<Status, string> = {
  fit: '适配',
  conditional: '有条件适配',
  conflict: '冲突',
  insufficient: '信息不足',
}

const v = (n: number | null, unit = '') => (n === null ? '未披露' : `${n}${unit}`)

export function sizeText(i: FurnitureItem): string {
  return `${v(i.width)} × ${v(i.depth)} × ${v(i.height)} cm`
}

export function drillText(i: FurnitureItem): string {
  return i.needsDrill === null ? '未披露' : i.needsDrill ? '需要' : '不需要'
}

/** 普通商品列表展示的参数，和电商详情页信息量一致，不含任何判断 */
export function paramRows(i: FurnitureItem): [string, string][] {
  return [
    ['品类', categoryName(i.category)],
    ['价格', v(i.price, ' 元')],
    ['运费安装费', v(i.extraFee, ' 元')],
    ['尺寸（宽×深×高）', sizeText(i)],
    ['包装最短边', v(i.packageMinSide, ' cm')],
    ['使用时前方所需空间', v(i.operationDepth, ' cm')],
    ['打孔固定', drillText(i)],
    ['拆装方式', assemblyName(i.assembly)],
    ['重量', v(i.weight, ' kg')],
  ]
}
