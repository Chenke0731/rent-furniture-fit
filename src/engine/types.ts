// 所有尺寸单位为厘米，金额单位为元；null 表示未填写或商家未披露。

export type Category = 'desk' | 'shelf' | 'cabinet'
export type DrillPolicy = 'allowed' | 'forbidden' | 'unknown'
export type LeaseTerm = 'lt6' | '6to12' | 'gt12'
/** assembled 整装发货不可拆；tool 需工具组装；toolfree 免工具拆装 */
export type Assembly = 'assembled' | 'tool' | 'toolfree'
export type Status = 'fit' | 'conditional' | 'conflict' | 'insufficient'

export interface Weights {
  cost: number // 1-5
  moving: number // 1-5
  function: number // 1-5
}

export interface RoomProfile {
  /** 放置位置可用宽度 */
  spaceWidth: number | null
  /** 放置位置纵深：从靠墙面到对面障碍物的距离 */
  spaceDepth: number | null
  /** 限高（窗台、吊柜、斜顶等），不限高可留空 */
  spaceHeight: number | null
  /** 搬运路线上最窄的门或通道净宽 */
  doorWidth: number | null
  /** 家具前方至少要留出的通行宽度 */
  clearance: number | null
  /** 单件含运费预算上限，不限可留空 */
  budget: number | null
  leaseTerm: LeaseTerm
  drill: DrillPolicy
  weights: Weights
}

export interface FurnitureItem {
  id: string
  name: string
  category: Category
  price: number | null
  /** 运费与安装费合计 */
  extraFee: number | null
  width: number | null
  depth: number | null
  height: number | null
  /** 外包装最短边 */
  packageMinSide: number | null
  /** 使用时前方需要的空间（拉椅子、开抽屉、开柜门） */
  operationDepth: number | null
  needsDrill: boolean | null
  assembly: Assembly | null
  weight: number | null
  source: string
  checkedAt: string | null
  isSample: boolean
  isManual: boolean
}

export interface CheckItem {
  key: string
  text: string
}

export interface ScoreBreakdown {
  cost: number // 0-1
  moving: number // 0-1
  function: number // 0-1
  total: number // 0-100
  highlights: string[]
  drawbacks: string[]
}

export interface DecisionResult {
  item: FurnitureItem
  status: Status
  totalCost: number | null
  passed: CheckItem[]
  conflicts: CheckItem[]
  missing: CheckItem[]
  warnings: CheckItem[]
  score: ScoreBreakdown | null
  rank: number | null
}
