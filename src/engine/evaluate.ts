import type {
  CheckItem,
  DecisionResult,
  FurnitureItem,
  RoomProfile,
  ScoreBreakdown,
  Status,
} from './types'

/**
 * 规则参数初始值，需在规则核验阶段按案例校准。
 */
export const RULES = {
  /** 尺寸余量小于该值时提示临界风险 */
  tightMarginCm: 2,
  /** 搬迁便利分中拆装方式与重量的占比 */
  movingAssemblyShare: 0.6,
  assemblyScore: { toolfree: 1, tool: 0.6, assembled: 0.2 } as Record<string, number>,
  /** 缺少数据时该维度取中间分 */
  neutralScore: 0.5,
}

const CATEGORY_NAME = { desk: '书桌', shelf: '置物架', cabinet: '收纳柜' }
const ASSEMBLY_NAME = { assembled: '整装不可拆', tool: '需工具组装', toolfree: '免工具拆装' }

export function categoryName(c: FurnitureItem['category']): string {
  return CATEGORY_NAME[c]
}
export function assemblyName(a: FurnitureItem['assembly']): string {
  return a ? ASSEMBLY_NAME[a] : '未披露'
}

const fmt = (n: number) => String(Math.round(n * 10) / 10)

interface Buckets {
  passed: CheckItem[]
  conflicts: CheckItem[]
  missing: CheckItem[]
  warnings: CheckItem[]
}

function checkSize(
  b: Buckets,
  key: string,
  label: string,
  itemValue: number | null,
  limit: number | null,
  limitLabel: string,
) {
  if (limit === null) return
  if (itemValue === null) {
    b.missing.push({ key, text: `商品未披露${label}，无法判断能否放下` })
    return
  }
  const diff = limit - itemValue
  if (diff < 0) {
    b.conflicts.push({ key, text: `${label} ${fmt(itemValue)} cm 超出${limitLabel} ${fmt(limit)} cm，差 ${fmt(-diff)} cm` })
  } else if (diff < RULES.tightMarginCm) {
    b.warnings.push({ key, text: `${label} ${fmt(itemValue)} cm，${limitLabel} ${fmt(limit)} cm，余量仅 ${fmt(diff)} cm，测量或安装误差可能导致放不下` })
  } else {
    b.passed.push({ key, text: `${label} ${fmt(itemValue)} cm，${limitLabel} ${fmt(limit)} cm，余量 ${fmt(diff)} cm` })
  }
}

function checkFrontSpace(b: Buckets, room: RoomProfile, item: FurnitureItem) {
  if (room.spaceDepth === null || item.depth === null || item.depth > room.spaceDepth) return
  const front = room.spaceDepth - item.depth
  const userNeed = room.clearance ?? 0
  const useNeed = item.operationDepth ?? 0
  const need = Math.max(userNeed, useNeed)
  const reason = useNeed > userNeed ? '使用所需空间' : '通行宽度'
  if (need > 0) {
    if (front < need) {
      b.conflicts.push({ key: 'front', text: `放下后前方剩余 ${fmt(front)} cm，少于${reason} ${fmt(need)} cm` })
    } else {
      b.passed.push({ key: 'front', text: `放下后前方剩余 ${fmt(front)} cm，满足${reason} ${fmt(need)} cm` })
    }
  }
  if (item.operationDepth === null && item.category !== 'shelf') {
    b.warnings.push({ key: 'operation', text: '商品未标注使用时前方所需空间（拉椅子、开抽屉或柜门），请按实物确认' })
  }
}

function checkDoor(b: Buckets, room: RoomProfile, item: FurnitureItem) {
  const door = room.doorWidth
  if (door === null) return
  if (item.packageMinSide !== null) {
    const diff = door - item.packageMinSide
    if (diff < 0) {
      b.conflicts.push({ key: 'door', text: `包装最短边 ${fmt(item.packageMinSide)} cm 大于最窄门宽 ${fmt(door)} cm，无法搬入` })
    } else if (diff < RULES.tightMarginCm) {
      b.warnings.push({ key: 'door', text: `包装最短边 ${fmt(item.packageMinSide)} cm，最窄门宽 ${fmt(door)} cm，余量仅 ${fmt(diff)} cm，搬运需倾斜通过` })
    } else {
      b.passed.push({ key: 'door', text: `包装最短边 ${fmt(item.packageMinSide)} cm，可通过最窄门宽 ${fmt(door)} cm` })
    }
    return
  }
  const dims = [item.width, item.depth, item.height]
  if (item.assembly === 'assembled' && dims.every((d) => d !== null)) {
    const productMin = Math.min(...(dims as number[]))
    if (productMin > door) {
      b.conflicts.push({ key: 'door', text: `整装发货，成品最短边 ${fmt(productMin)} cm 已大于最窄门宽 ${fmt(door)} cm，无法搬入` })
      return
    }
  }
  if (item.assembly === 'tool' || item.assembly === 'toolfree') {
    b.warnings.push({ key: 'door', text: `未披露包装尺寸；该款拆装发货，购买前需向客服确认包装最短边不超过 ${fmt(door)} cm` })
  } else {
    b.missing.push({ key: 'door', text: `未披露包装尺寸，且非拆装发货，无法判断能否通过 ${fmt(door)} cm 的门` })
  }
}

function checkDrill(b: Buckets, room: RoomProfile, item: FurnitureItem) {
  if (item.needsDrill === true) {
    if (room.drill === 'forbidden') b.conflicts.push({ key: 'drill', text: '需要打孔固定，但房东不允许打孔' })
    else if (room.drill === 'unknown') b.warnings.push({ key: 'drill', text: '需要打孔固定，购买前需向房东确认是否允许' })
    else b.passed.push({ key: 'drill', text: '需要打孔固定，房东允许打孔' })
  } else if (item.needsDrill === false) {
    b.passed.push({ key: 'drill', text: '无需打孔' })
  } else {
    if (room.drill === 'forbidden') b.missing.push({ key: 'drill', text: '未披露是否需要打孔固定，而房东不允许打孔' })
    else if (room.drill === 'unknown') b.warnings.push({ key: 'drill', text: '未披露是否需要打孔固定，房东态度也未确认' })
  }
}

function checkBudget(b: Buckets, room: RoomProfile, item: FurnitureItem) {
  if (item.price === null) {
    b.missing.push({ key: 'budget', text: '未披露价格' })
    return
  }
  if (room.budget === null) return
  if (item.price > room.budget) {
    b.conflicts.push({ key: 'budget', text: `商品价 ${fmt(item.price)} 元已超出预算 ${fmt(room.budget)} 元` })
  } else if (item.extraFee === null) {
    b.warnings.push({ key: 'budget', text: `商品价 ${fmt(item.price)} 元未超预算，运费和安装费未披露，含费后需再确认` })
  } else {
    const total = item.price + item.extraFee
    if (total > room.budget) {
      b.conflicts.push({ key: 'budget', text: `含运费安装费共 ${fmt(total)} 元，超出预算 ${fmt(room.budget)} 元` })
    } else {
      b.passed.push({ key: 'budget', text: `含运费安装费共 ${fmt(total)} 元，在预算 ${fmt(room.budget)} 元内` })
    }
  }
}

function checkLease(b: Buckets, room: RoomProfile, item: FurnitureItem) {
  if (room.leaseTerm === 'lt6' && item.assembly === 'assembled') {
    b.warnings.push({ key: 'lease', text: '预计租期不足 6 个月，该款整装不可拆，搬家时需整体搬运' })
  }
}

function checkRoomProfile(b: Buckets, room: RoomProfile) {
  if (room.spaceWidth === null) b.missing.push({ key: 'room-width', text: '租房档案未填写可用宽度' })
  if (room.spaceDepth === null) b.missing.push({ key: 'room-depth', text: '租房档案未填写放置纵深' })
  if (room.doorWidth === null) b.missing.push({ key: 'room-door', text: '租房档案未填写最窄门宽' })
}

export function decideStatus(b: Buckets): Status {
  if (b.conflicts.length) return 'conflict'
  if (b.missing.length) return 'insufficient'
  if (b.warnings.length) return 'conditional'
  return 'fit'
}

/** 第一阶段：逐项检查硬约束 */
export function checkItem(room: RoomProfile, item: FurnitureItem): DecisionResult {
  const b: Buckets = { passed: [], conflicts: [], missing: [], warnings: [] }
  checkRoomProfile(b, room)
  checkSize(b, 'width', '宽度', item.width, room.spaceWidth, '可用宽度')
  checkSize(b, 'depth', '深度', item.depth, room.spaceDepth, '放置纵深')
  checkFrontSpace(b, room, item)
  checkSize(b, 'height', '高度', item.height, room.spaceHeight, '限高')
  checkDoor(b, room, item)
  checkDrill(b, room, item)
  checkBudget(b, room, item)
  checkLease(b, room, item)
  const totalCost = item.price === null ? null : item.price + (item.extraFee ?? 0)
  return { item, status: decideStatus(b), totalCost, ...b, score: null, rank: null }
}

/** 越大越好的 min-max 归一化；只有一个值或全部相同时取 1 */
function normalize(values: (number | null)[], higherIsBetter: boolean): number[] {
  const known = values.filter((v): v is number => v !== null)
  const min = Math.min(...known)
  const max = Math.max(...known)
  return values.map((v) => {
    if (v === null) return RULES.neutralScore
    if (max === min) return 1
    const r = (v - min) / (max - min)
    return higherIsBetter ? r : 1 - r
  })
}

function functionSize(item: FurnitureItem): number | null {
  const { width, depth, height } = item
  if (width === null || depth === null) return null
  if (item.category === 'desk') return width * depth
  return height === null ? null : width * depth * height
}

function functionLabel(item: FurnitureItem): string {
  return item.category === 'desk' ? '桌面面积' : '收纳容积'
}

/** 第二阶段：对适配和有条件适配的商品按偏好打分排序 */
export function rankResults(results: DecisionResult[], room: RoomProfile): void {
  const eligible = results.filter((r) => r.status === 'fit' || r.status === 'conditional')
  if (!eligible.length) return
  const multi = eligible.length > 1

  const cost = normalize(eligible.map((r) => r.totalCost), false)
  const weight = normalize(eligible.map((r) => r.item.weight), false)
  const func = new Array<number>(eligible.length)
  for (const cat of ['desk', 'shelf', 'cabinet'] as const) {
    const idx = eligible.map((r, i) => (r.item.category === cat ? i : -1)).filter((i) => i >= 0)
    const scores = normalize(idx.map((i) => functionSize(eligible[i].item)), true)
    idx.forEach((i, k) => (func[i] = scores[k]))
  }

  const w = room.weights
  const wSum = w.cost + w.moving + w.function || 1
  eligible.forEach((r, i) => {
    const a = r.item.assembly
    const asm = a ? RULES.assemblyScore[a] : RULES.neutralScore
    const moving = RULES.movingAssemblyShare * asm + (1 - RULES.movingAssemblyShare) * weight[i]
    const total = ((w.cost * cost[i] + w.moving * moving + w.function * func[i]) / wSum) * 100
    const highlights: string[] = []
    const drawbacks: string[] = []
    if (multi) {
      const costText = r.totalCost === null ? '' : `（约 ${fmt(r.totalCost)} 元）`
      if (cost[i] >= 0.8) highlights.push(`总成本在候选中较低${costText}`)
      if (cost[i] <= 0.2) drawbacks.push(`总成本在候选中较高${costText}`)
      const movingText = `（${assemblyName(a)}${r.item.weight === null ? '' : `，${fmt(r.item.weight)} kg`}）`
      if (moving >= 0.8) highlights.push(`拆装搬迁方便${movingText}`)
      if (moving <= 0.3) drawbacks.push(`拆装搬迁不便${movingText}`)
      if (func[i] >= 0.8 && functionSize(r.item) !== null) highlights.push(`${functionLabel(r.item)}在同类候选中较大`)
      if (func[i] <= 0.2 && functionSize(r.item) !== null) drawbacks.push(`${functionLabel(r.item)}在同类候选中较小`)
    }
    const score: ScoreBreakdown = {
      cost: cost[i],
      moving,
      function: func[i],
      total: Math.round(total * 10) / 10,
      highlights,
      drawbacks,
    }
    r.score = score
  })
  eligible
    .slice()
    .sort((x, y) => (y.score!.total - x.score!.total))
    .forEach((r, i) => (r.rank = i + 1))
}

const STATUS_ORDER: Record<Status, number> = { fit: 0, conditional: 0, conflict: 1, insufficient: 2 }

/** 完整两阶段决策：返回结果按“可选（按排名）→ 冲突 → 信息不足”排列 */
export function evaluate(room: RoomProfile, items: FurnitureItem[]): DecisionResult[] {
  const results = items.map((item) => checkItem(room, item))
  rankResults(results, room)
  return results.sort((a, b) => {
    const s = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    if (s !== 0) return s
    return (a.rank ?? 0) - (b.rank ?? 0)
  })
}
