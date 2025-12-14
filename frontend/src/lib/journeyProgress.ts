type StageKey = 'stage1' | 'stage2' | 'stage3'

export type Stage3State = {
  riskFactorIds: string[]
  symptomIds: string[]
}

type JourneyProgress = Partial<
  Record<
    StageKey,
    {
      unlocked?: boolean
      stage3State?: Stage3State
    }
  >
>

const STORAGE_KEY = 'journeyProgress.v1'

const safeParse = (value: string | null): JourneyProgress => {
  if (!value) return {}
  try {
    const parsed = JSON.parse(value) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as JourneyProgress
  } catch {
    return {}
  }
}

export const getProgress = (): JourneyProgress => {
  if (typeof window === 'undefined') return {}
  return safeParse(window.localStorage.getItem(STORAGE_KEY))
}

export const setProgress = (next: JourneyProgress) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export const getStageUnlocked = (stage: StageKey) => Boolean(getProgress()[stage]?.unlocked)

export const setStageUnlocked = (stage: StageKey, unlocked: boolean) => {
  const prev = getProgress()
  const next: JourneyProgress = {
    ...prev,
    [stage]: { ...(prev[stage] ?? {}), unlocked },
  }
  setProgress(next)
}

export const getStage3State = (): Stage3State | null => {
  const progress = getProgress()
  const state = progress.stage3?.stage3State
  if (!state) return null
  if (!Array.isArray(state.riskFactorIds) || !Array.isArray(state.symptomIds)) return null
  return {
    riskFactorIds: state.riskFactorIds.filter((item) => typeof item === 'string'),
    symptomIds: state.symptomIds.filter((item) => typeof item === 'string'),
  }
}

export const setStage3State = (state: Stage3State) => {
  const prev = getProgress()
  const next: JourneyProgress = {
    ...prev,
    stage3: {
      ...(prev.stage3 ?? {}),
      stage3State: {
        riskFactorIds: state.riskFactorIds,
        symptomIds: state.symptomIds,
      },
    },
  }
  setProgress(next)
}
