import type { StageKey, User, StageProgress, AllProgressMap, ApiResponse, UserWithProgress } from '../types'

const API_BASE_URL = 'http://localhost:8000/api.php'

const VALID_STAGES: StageKey[] = [
  'stage1',
  'stage2',
  'stage3',
  'stage4',
  'stage5',
  'stage6',
  'stage7',
  'stage8',
  'stage9',
  'stage10',
  'stage11',
  'stage12',
  'stage13',
]

/* Auth API */

export const login = async (username: string, password: string): Promise<ApiResponse<{ user: User }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    return await response.json()
  } catch (error) {
    return { success: false, message: `Login failed: ${error}` }
  }
}

export const register = async (username: string, password: string): Promise<ApiResponse<{ user: User }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}?action=register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    return await response.json()
  } catch (error) {
    return { success: false, message: `Registration failed: ${error}` }
  }
}

/* Progress API */

export const saveStageProgress = async (
  userId: number,
  stage: StageKey,
  completed: boolean = true
): Promise<ApiResponse<StageProgress>> => {
  if (!VALID_STAGES.includes(stage)) {
    return { success: false, message: 'Invalid stage' }
  }

  try {
    const response = await fetch(`${API_BASE_URL}?action=save_progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, stage, completed }),
    })
    return await response.json()
  } catch (error) {
    return { success: false, message: `Failed to save progress: ${error}` }
  }
}

export const getStageProgress = async (userId: number, stage: StageKey): Promise<ApiResponse<StageProgress>> => {
  try {
    const response = await fetch(`${API_BASE_URL}?action=get_progress&userId=${userId}&stage=${stage}`)
    return await response.json()
  } catch (error) {
    return { success: false, message: `Failed to get progress: ${error}` }
  }
}

export const getAllProgress = async (userId: number): Promise<ApiResponse<AllProgressMap>> => {
  try {
    const response = await fetch(`${API_BASE_URL}?action=get_all_progress&userId=${userId}`)
    return await response.json()
  } catch (error) {
    return { success: false, message: `Failed to get all progress: ${error}` }
  }
}

/* Admin API */

export const adminGetAllUsersProgress = async (): Promise<ApiResponse<UserWithProgress[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}?action=admin_get_all_users_progress`)
    return await response.json()
  } catch (error) {
    return { success: false, message: `Failed to get all users progress: ${error}` }
  }
}
