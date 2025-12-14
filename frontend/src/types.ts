export type StageKey = 'stage1' | 'stage2' | 'stage3' | 'stage4'

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

export type JourneyProgress = Partial<
  Record<
    StageKey,
    {
      unlocked?: boolean
      stage3State?: Stage3State
    }
  >
>

export type ApiResponse<T = unknown> = {
  success: boolean
  message: string
  data?: T
}
