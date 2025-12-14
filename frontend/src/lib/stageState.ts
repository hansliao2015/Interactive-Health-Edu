import type { StageKey } from '../types'
import { getStoredUser } from './storage'

const KEY_PREFIX = 'journey.stageState.v1'

const getStorageKey = (stage: StageKey) => {
  const user = getStoredUser()
  const subject = user ? String(user.id) : 'guest'
  return `${KEY_PREFIX}.${subject}.${stage}`
}

export const getStageState = <T>(stage: StageKey): T | null => {
  if (typeof window === 'undefined') return null
  const key = getStorageKey(stage)
  const raw = window.localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export const setStageState = <T>(stage: StageKey, state: T) => {
  if (typeof window === 'undefined') return
  const key = getStorageKey(stage)
  window.localStorage.setItem(key, JSON.stringify(state))
}

export const clearStageState = (stage: StageKey) => {
  if (typeof window === 'undefined') return
  const key = getStorageKey(stage)
  window.localStorage.removeItem(key)
}

