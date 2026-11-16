import { computed, reactive, watch } from 'vue'
import type { FurnitureItem, RoomProfile } from '@/engine/types'
import { SAMPLE_ITEMS } from '@/data/sample'

const KEY = 'rff_state_v1'

export const MAX_SELECT = 5
export const MIN_SELECT = 2

export function emptyProfile(): RoomProfile {
  return {
    spaceWidth: null,
    spaceDepth: null,
    spaceHeight: null,
    doorWidth: null,
    clearance: null,
    budget: null,
    leaseTerm: '6to12',
    drill: 'unknown',
    weights: { cost: 3, moving: 3, function: 3 },
  }
}

interface State {
  profile: RoomProfile
  profileSaved: boolean
  manualItems: FurnitureItem[]
  selectedIds: string[]
}

function load(): State {
  const fallback: State = { profile: emptyProfile(), profileSaved: false, manualItems: [], selectedIds: [] }
  try {
    const raw = uni.getStorageSync(KEY)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

export const state = reactive<State>(load())

watch(state, () => uni.setStorageSync(KEY, JSON.stringify(state)), { deep: true })

export const allItems = computed<FurnitureItem[]>(() => [...state.manualItems, ...SAMPLE_ITEMS])

export const selectedItems = computed(() =>
  state.selectedIds.map((id) => allItems.value.find((i) => i.id === id)).filter((i): i is FurnitureItem => !!i),
)

export function toggleSelect(id: string): boolean {
  const idx = state.selectedIds.indexOf(id)
  if (idx >= 0) {
    state.selectedIds.splice(idx, 1)
    return true
  }
  if (state.selectedIds.length >= MAX_SELECT) return false
  state.selectedIds.push(id)
  return true
}

export function addManualItem(item: FurnitureItem) {
  state.manualItems.unshift(item)
  if (state.selectedIds.length < MAX_SELECT) state.selectedIds.push(item.id)
}

export function removeManualItem(id: string) {
  state.manualItems = state.manualItems.filter((i) => i.id !== id)
  state.selectedIds = state.selectedIds.filter((s) => s !== id)
}
