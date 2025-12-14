import type { User } from '../types'

const USER_KEY = 'currentUser'

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
