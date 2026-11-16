import { describe, expect, it } from 'vitest'
import { checkItem, evaluate } from '../src/engine/evaluate'
import type { FurnitureItem, RoomProfile } from '../src/engine/types'
import { SAMPLE_ITEMS } from '../src/data/sample'
import { TASKS, sequenceFor } from '../src/data/tasks'

const room = (o: Partial<RoomProfile> = {}): RoomProfile => ({
  spaceWidth: 110,
  spaceDepth: 150,
  spaceHeight: null,
  doorWidth: 80,
  clearance: 60,
  budget: 600,
  leaseTerm: '6to12',
  drill: 'forbidden',
  weights: { cost: 3, moving: 3, function: 3 },
  ...o,
})

const item = (o: Partial<FurnitureItem> = {}): FurnitureItem => ({
  id: 'X',
  name: '测试书桌',
  category: 'desk',
  price: 400,
  extraFee: 30,
  width: 100,
  depth: 50,
  height: 75,
  packageMinSide: 15,
  operationDepth: 70,
  needsDrill: false,
  assembly: 'tool',
  weight: 18,
  source: 'test',
  checkedAt: null,
  isSample: true,
  isManual: false,
  ...o,
})

describe('硬约束：状态判定', () => {
  it('参数齐全且全部满足时为适配', () => {
    const r = checkItem(room(), item())
    expect(r.status).toBe('fit')
    expect(r.totalCost).toBe(430)
  })

  it('宽度超出为冲突，并写明差值', () => {
    const r = checkItem(room(), item({ width: 120 }))
    expect(r.status).toBe('conflict')
    expect(r.conflicts[0].text).toContain('差 10 cm')
  })

  it('已知冲突优先于缺失信息', () => {
    const r = checkItem(room(), item({ width: 120, packageMinSide: null, assembly: 'assembled' }))
    expect(r.status).toBe('conflict')
    expect(r.missing.length).toBeGreaterThan(0)
  })

  it('缺少深度时为信息不足，不因价格低判为适配', () => {
    const r = checkItem(room(), item({ depth: null, price: 99 }))
    expect(r.status).toBe('insufficient')
  })

  it('余量小于临界值为有条件适配', () => {
    const r = checkItem(room({ spaceWidth: 101 }), item())
    expect(r.status).toBe('conditional')
  })

  it('租房档案缺少必填项时为信息不足', () => {
    const r = checkItem(room({ doorWidth: null }), item())
    expect(r.status).toBe('insufficient')
  })
})

describe('硬约束：前方空间', () => {
  it('前方剩余少于通行宽度为冲突', () => {
    const r = checkItem(room({ spaceDepth: 100, clearance: 60 }), item({ depth: 50, operationDepth: null }))
    expect(r.status).toBe('conflict')
  })

  it('使用所需空间大于通行宽度时按使用空间判断', () => {
    const r = checkItem(room({ spaceDepth: 125, clearance: 60 }), item({ depth: 50, operationDepth: 80 }))
    expect(r.conflicts[0].text).toContain('使用所需空间 80 cm')
  })

  it('书桌未标注使用空间时提示确认', () => {
    const r = checkItem(room(), item({ operationDepth: null }))
    expect(r.status).toBe('conditional')
  })
})

describe('硬约束：搬运过门', () => {
  it('包装最短边大于门宽为冲突', () => {
    expect(checkItem(room({ doorWidth: 60 }), item({ packageMinSide: 65 })).status).toBe('conflict')
  })

  it('整装且成品最短边大于门宽时，无包装尺寸也判冲突', () => {
    const r = checkItem(room({ doorWidth: 45 }), item({ packageMinSide: null, assembly: 'assembled', depth: 50 }))
    expect(r.status).toBe('conflict')
  })

  it('整装且未披露包装尺寸为信息不足', () => {
    expect(checkItem(room(), item({ packageMinSide: null, assembly: 'assembled' })).status).toBe('insufficient')
  })

  it('拆装发货未披露包装尺寸为有条件适配', () => {
    expect(checkItem(room(), item({ packageMinSide: null, assembly: 'toolfree' })).status).toBe('conditional')
  })
})

describe('硬约束：打孔、预算、租期', () => {
  it('需打孔且房东禁止为冲突', () => {
    expect(checkItem(room(), item({ needsDrill: true })).status).toBe('conflict')
  })
  it('需打孔且房东态度未知为有条件适配', () => {
    expect(checkItem(room({ drill: 'unknown' }), item({ needsDrill: true })).status).toBe('conditional')
  })
  it('未披露是否打孔且房东禁止为信息不足', () => {
    expect(checkItem(room(), item({ needsDrill: null })).status).toBe('insufficient')
  })
  it('含运费超预算为冲突', () => {
    expect(checkItem(room({ budget: 420 }), item()).status).toBe('conflict')
  })
  it('运费未披露但商品价未超预算为有条件适配', () => {
    expect(checkItem(room(), item({ extraFee: null })).status).toBe('conditional')
  })
  it('短租选整装家具提示搬家成本', () => {
    const r = checkItem(room({ leaseTerm: 'lt6' }), item({ assembly: 'assembled' }))
    expect(r.warnings.some((w) => w.key === 'lease')).toBe(true)
  })
})

describe('偏好排序', () => {
  it('只对适配和有条件适配的商品排名', () => {
    const results = evaluate(room(), [item({ id: 'a' }), item({ id: 'b', width: 130 }), item({ id: 'c', price: 300 })])
    const ranked = results.filter((r) => r.rank !== null)
    expect(ranked.map((r) => r.item.id)).toEqual(['c', 'a'])
    expect(results.find((r) => r.item.id === 'b')!.score).toBeNull()
  })

  it('成本权重高时选更便宜的，搬迁权重高时选更易拆装的', () => {
    const cheap = item({ id: 'cheap', price: 300, assembly: 'tool', weight: 25 })
    const easy = item({ id: 'easy', price: 450, assembly: 'toolfree', weight: 12 })
    const byCost = evaluate(room({ weights: { cost: 5, moving: 1, function: 1 } }), [cheap, easy])
    const byMoving = evaluate(room({ weights: { cost: 1, moving: 5, function: 1 } }), [cheap, easy])
    expect(byCost[0].item.id).toBe('cheap')
    expect(byMoving[0].item.id).toBe('easy')
  })
})

describe('示例数据与对照任务', () => {
  const byId = Object.fromEntries(SAMPLE_ITEMS.map((i) => [i.id, i]))
  const statusOf = (taskIdx: number) =>
    Object.fromEntries(
      evaluate(TASKS[taskIdx].room, TASKS[taskIdx].candidateIds.map((id) => byId[id])).map((r) => [r.item.id, r.status]),
    )

  it('任务一覆盖四种状态', () => {
    expect(statusOf(0)).toEqual({ D1: 'conflict', D2: 'fit', D3: 'conditional', D4: 'insufficient', D5: 'conflict' })
  })

  it('任务二覆盖四种状态', () => {
    expect(statusOf(1)).toEqual({
      S1: 'conflict',
      S2: 'conditional',
      S3: 'insufficient',
      C1: 'insufficient',
      C2: 'fit',
      C3: 'conflict',
    })
  })

  it('四组顺序平衡条件先后和任务搭配', () => {
    const seqs = [1, 2, 3, 4].map(sequenceFor)
    expect(seqs.filter((s) => s[0].condition === 'A').length).toBe(2)
    expect(seqs.filter((s) => s.some((x) => x.taskId === 'T1' && x.condition === 'A')).length).toBe(2)
    expect(sequenceFor(5)).toEqual(sequenceFor(1))
  })
})
