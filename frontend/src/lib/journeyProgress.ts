import type { StageKey, AllProgressMap } from '../types'
import * as api from './api'
import * as storage from './storage'

export const getStageUnlocked = async (stage: StageKey): Promise<boolean> => {
  const user = storage.getStoredUser()
  if (!user) return false

  try {
    const result = await api.getStageProgress(user.id, stage)
    return result.success && result.data?.completed === true
  } catch {
    return false
  }
}

export const setStageUnlocked = async (stage: StageKey, unlocked: boolean): Promise<boolean> => {
  const user = storage.getStoredUser()
  if (!user) return false

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
