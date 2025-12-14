import { getStageUnlocked } from './journeyProgress'

const stageOrder = ['stage1', 'stage2', 'stage3', 'stage4', 'stage5', 'stage6', 'stage7'] as const
export type GuardStageKey = (typeof stageOrder)[number]

export const resolveLockedRedirectPath = async (target: GuardStageKey): Promise<string | null> => {
  const index = stageOrder.indexOf(target)
  if (index <= 0) return null

  const prevStage = stageOrder[index - 1]
  const prevUnlocked = await getStageUnlocked(prevStage)
  if (prevUnlocked) return null

  const priorStages = stageOrder.slice(0, index)
  const unlockedList = await Promise.all(priorStages.map((stage) => getStageUnlocked(stage)))

  let lastUnlocked: GuardStageKey = 'stage1'
  for (let i = 0; i < priorStages.length; i += 1) {
    if (unlockedList[i]) lastUnlocked = priorStages[i]
  }

  return `/journey/${lastUnlocked}`
}

