import type { Condition } from '@/data/tasks'
import type { Status } from '@/engine/types'

const KEY = 'rff_experiment_v1'

export interface ExperimentRecord {
  participant: number
  group: number
  step: number
  taskId: string
  condition: Condition
  startedAt: string
  durationSec: number
  selectedId: string
  selectedName: string
  selectedStatus: Status
  isError: boolean
  expandCount: number
  understanding: number
  satisfaction: number
}

export function loadRecords(): ExperimentRecord[] {
  try {
    const raw = uni.getStorageSync(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveRecord(r: ExperimentRecord) {
  const all = loadRecords().filter((x) => !(x.participant === r.participant && x.step === r.step))
  all.push(r)
  uni.setStorageSync(KEY, JSON.stringify(all))
}

export function clearRecords() {
  uni.removeStorageSync(KEY)
}

const COLUMNS: (keyof ExperimentRecord)[] = [
  'participant',
  'group',
  'step',
  'taskId',
  'condition',
  'startedAt',
  'durationSec',
  'selectedId',
  'selectedName',
  'selectedStatus',
  'isError',
  'expandCount',
  'understanding',
  'satisfaction',
]

export function toCsv(records: ExperimentRecord[]): string {
  const esc = (v: unknown) => {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const rows = records
    .slice()
    .sort((a, b) => a.participant - b.participant || a.step - b.step)
    .map((r) => COLUMNS.map((c) => esc(r[c])).join(','))
  return [COLUMNS.join(','), ...rows].join('\n')
}
