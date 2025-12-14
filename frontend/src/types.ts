export type StageKey =
  | 'stage1'
  | 'stage2'
  | 'stage3'
  | 'stage4'
  | 'stage5'
  | 'stage6'
  | 'stage7'
  | 'stage8'
  | 'stage9'
  | 'stage10'
  | 'stage11'
  | 'stage12'
  | 'stage13'

export type User = {
  id: number
  username: string
}

export type StageProgress = {
  stage: StageKey
  completed: boolean
  completedAt: string | null
}

export type AllProgressMap = Partial<Record<StageKey, {
  completed: boolean
  completedAt: string | null
}>>

export type Stage3State = {
  riskFactorIds: string[]
  symptomIds: string[]
}

export type ApiResponse<T = unknown> = {
  success: boolean
  message: string
  data?: T
}
