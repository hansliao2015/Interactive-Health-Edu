import type { User, Stage3State } from '../types'

const USER_KEY = 'currentUser'
const STAGE3_STATE_PREFIX = 'stage3State_'

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null
  const stored = window.localStorage.getItem(USER_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored) as User
  } catch {
    return null
  }
}

export const setStoredUser = (user: User | null) => {
  if (typeof window === 'undefined') return
  if (user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    window.localStorage.removeItem(USER_KEY)
  }
}

export const getStage3State = (): Stage3State | null => {
  if (typeof window === 'undefined') return null
  const user = getStoredUser()
  if (!user) return null
  const stored = window.localStorage.getItem(`${STAGE3_STATE_PREFIX}${user.id}`)
  if (!stored) return null
  try {
    return JSON.parse(stored) as Stage3State
  } catch {
    return null
  }
}

export const setStage3State = (state: Stage3State | null) => {
  if (typeof window === 'undefined') return
  const user = getStoredUser()
  if (!user) return
  if (state) {
    window.localStorage.setItem(`${STAGE3_STATE_PREFIX}${user.id}`, JSON.stringify(state))
  } else {
    window.localStorage.removeItem(`${STAGE3_STATE_PREFIX}${user.id}`)
  }
}
