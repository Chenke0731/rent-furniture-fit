import type { RoomProfile } from '@/engine/types'

export type Condition = 'A' | 'B'

export interface ExperimentTask {
  id: 'T1' | 'T2'
  title: string
  description: string
  room: RoomProfile
  candidateIds: string[]
}

const defaultWeights = { cost: 3, moving: 3, function: 3 }

/** 对照任务：候选商品和房间条件固定，保证两组比较的是同一任务 */
export const TASKS: ExperimentTask[] = [
  {
    id: 'T1',
    title: '任务一：为出租屋选一张书桌',
    description:
      '书桌靠墙摆放。放置位置可用宽度 110 cm，从墙面到床沿 150 cm；坐下学习需要前方留出至少 60 cm。搬运路线最窄的门净宽 80 cm。房东不允许在墙上打孔。预计租期 6—12 个月，单件含运费预算 600 元。',
    room: {
      spaceWidth: 110,
      spaceDepth: 150,
      spaceHeight: null,
      doorWidth: 80,
      clearance: 60,
      budget: 600,
      leaseTerm: '6to12',
      drill: 'forbidden',
      weights: defaultWeights,
    },
    candidateIds: ['D1', 'D2', 'D3', 'D4', 'D5'],
  },
  {
    id: 'T2',
    title: '任务二：为出租屋选一件置物架或收纳柜',
    description:
      '放在墙角。可用宽度 80 cm，从墙面到对面柜子 100 cm，上方有斜顶，限高 180 cm；前方通行需要至少 50 cm。搬运路线最窄的门净宽 75 cm。房东不允许在墙上打孔。预计租期不足 6 个月，单件含运费预算 400 元。',
    room: {
      spaceWidth: 80,
      spaceDepth: 100,
      spaceHeight: 180,
      doorWidth: 75,
      clearance: 50,
      budget: 400,
      leaseTerm: 'lt6',
      drill: 'forbidden',
      weights: defaultWeights,
    },
    candidateIds: ['S1', 'S2', 'S3', 'C1', 'C2', 'C3'],
  },
]

/**
 * 按参与者编号分 4 组，平衡条件顺序与任务—条件搭配。
 * A：普通商品列表；B：适配判断与决策卡。
 */
export function sequenceFor(participantNo: number): { taskId: 'T1' | 'T2'; condition: Condition }[] {
  const g = (((participantNo - 1) % 4) + 4) % 4
  return [
    [{ taskId: 'T1', condition: 'A' }, { taskId: 'T2', condition: 'B' }],
    [{ taskId: 'T1', condition: 'B' }, { taskId: 'T2', condition: 'A' }],
    [{ taskId: 'T2', condition: 'A' }, { taskId: 'T1', condition: 'B' }],
    [{ taskId: 'T2', condition: 'B' }, { taskId: 'T1', condition: 'A' }],
  ][g] as { taskId: 'T1' | 'T2'; condition: Condition }[]
}

export function groupOf(participantNo: number): number {
  return ((((participantNo - 1) % 4) + 4) % 4) + 1
}
