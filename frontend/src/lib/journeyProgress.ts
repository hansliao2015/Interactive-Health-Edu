import type { AllProgressMap, StageKey } from '../types'
import * as api from './api'
import * as storage from './storage'

export type Stage4Scenario = 'normal' | 'restricted'

export type Stage4TimeSlotId =
  | 'wake'
  | 'afterBreakfast'
  | 'beforeNoon'
  | 'afterLunch'
  | 'afternoon'
  | 'beforeDinner'
  | 'beforeSleep'

export type Stage4State = {
  scenario: Stage4Scenario
  weightKg: number | null
  yesterdayUrineMl: number | null
  entriesMl: Partial<Record<Stage4TimeSlotId, number>>
  plannedIntake?: number | null
}

type JourneyProgress = Partial<
  Record<
    StageKey,
    {
      unlocked?: boolean
      stage4State?: Stage4State
    }
  >
>

const STORAGE_KEY = 'journeyProgress.v1'

const safeParse = (value: string | null): JourneyProgress => {
  if (!value) return {}
  try {
    return JSON.parse(value) as JourneyProgress
  } catch {
    return {}
  }
}

const getProgress = (): JourneyProgress => {
  if (typeof window === 'undefined') return {}
  return safeParse(window.localStorage.getItem(STORAGE_KEY))
}

const setProgress = (next: JourneyProgress) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

const getLocalStageUnlocked = (stage: StageKey) => Boolean(getProgress()[stage]?.unlocked)

const setLocalStageUnlocked = (stage: StageKey, unlocked: boolean) => {
  const prev = getProgress()
  const next: JourneyProgress = {
    ...prev,
    [stage]: { ...(prev[stage] ?? {}), unlocked },
  }
  setProgress(next)
}

export const getStageUnlocked = async (stage: StageKey): Promise<boolean> => {
  const user = storage.getStoredUser()
  if (!user) return getLocalStageUnlocked(stage)

  try {
    const result = await api.getStageProgress(user.id, stage)
    const unlocked = result.success && result.data?.completed === true
    setLocalStageUnlocked(stage, unlocked)
    return unlocked
  } catch {
    return getLocalStageUnlocked(stage)
  }
}

export const setStageUnlocked = async (stage: StageKey, unlocked: boolean): Promise<boolean> => {
  setLocalStageUnlocked(stage, unlocked)
  const user = storage.getStoredUser()
  if (!user) return true

  try {
    const result = await api.saveStageProgress(user.id, stage, unlocked)
    return result.success
  } catch {
    return false
  }
}

export const getAllStagesProgress = async (): Promise<AllProgressMap> => {
  const user = storage.getStoredUser()
  if (!user) return {}

  try {
    const result = await api.getAllProgress(user.id)
    return result.success && result.data ? result.data : {}
  } catch {
    return {}
  }
}

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

export const getStage4State = (): Stage4State | null => {
  const progress = getProgress()
  const state = progress.stage4?.stage4State
  if (!state || typeof state !== 'object') return null

  const scenario = (state as Stage4State).scenario
  if (scenario !== 'normal' && scenario !== 'restricted') return null

  const weightKgRaw = (state as Stage4State).weightKg
  const yesterdayUrineMlRaw = (state as Stage4State).yesterdayUrineMl

  const weightKg = isFiniteNumber(weightKgRaw) ? weightKgRaw : null
  const yesterdayUrineMl = isFiniteNumber(yesterdayUrineMlRaw) ? yesterdayUrineMlRaw : null

  const entriesRaw = (state as Stage4State).entriesMl
  const entriesMl: Partial<Record<Stage4TimeSlotId, number>> = {}

  if (entriesRaw && typeof entriesRaw === 'object') {
    const allowed: Stage4TimeSlotId[] = [
      'wake',
      'afterBreakfast',
      'beforeNoon',
      'afterLunch',
      'afternoon',
      'beforeDinner',
      'beforeSleep',
    ]

    for (const key of allowed) {
      const value = (entriesRaw as Record<string, unknown>)[key]
      if (isFiniteNumber(value)) entriesMl[key] = value
    }
  }

  const plannedIntakeRaw = (state as Stage4State).plannedIntake
  const plannedIntake = isFiniteNumber(plannedIntakeRaw) ? plannedIntakeRaw : null

  return {
    scenario,
    weightKg,
    yesterdayUrineMl,
    entriesMl,
    plannedIntake,
  }
}

export const setStage4State = (state: Stage4State) => {
  const prev = getProgress()
  const next: JourneyProgress = {
    ...prev,
    stage4: {
      ...(prev.stage4 ?? {}),
      stage4State: state,
    },
  }
  setProgress(next)
}

