import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { resolveLockedRedirectPath } from '../lib/journeyGuard'
import { getStageUnlocked, setStageUnlocked } from '../lib/journeyProgress'
import { getStageState, setStageState } from '../lib/stageState'
export type DietPrincipleId = 'protein' | 'calories' | 'salt' | 'phosphorus' | 'potassium'

export type DietPrinciple = {
  id: DietPrincipleId
  title: string
  subtitle: string
  hint: string
  icon: string
  gradient: string
  border: string
  keyPoints: string[]
  actions: string[]
}

export const dietPrinciples: DietPrinciple[] = [
  {
    id: 'protein',
    title: '低蛋白飲食',
    subtitle: '0.6～0.8 g/kg',
    hint: '腎絲球過濾率下降時，蛋白質攝取要依個別情況調整。',
    icon: '🥩',
    gradient: 'from-sky-50 via-white to-cyan-50',
    border: 'border-sky-200',
    keyPoints: ['重點是「吃對量」，不是完全不吃。', '蛋白質吃太多會增加腎臟負擔。'],
    actions: ['用體重換算 0.6～0.8 g/kg 的區間。', '用「一份蛋白質=7g」換算更好掌握。'],
  },
  {
    id: 'calories',
    title: '足夠熱量',
    subtitle: '30～35 大卡/kg',
    hint: '熱量不足時，身體可能分解肌肉，反而增加代謝負擔。',
    icon: '🔥',
    gradient: 'from-amber-50 via-white to-rose-50',
    border: 'border-amber-200',
    keyPoints: ['熱量夠，蛋白質才能用在修補與維持體力。', '三餐規律比硬撐更重要。'],
    actions: ['用體重換算 30～35 大卡/kg。', '用油脂/堅果種子類協助達成熱量。'],
  },
  {
    id: 'salt',
    title: '鹽分控制',
    subtitle: '鈉 2000mg（鹽 5g）',
    hint: '少鹽能幫助控制血壓與減少水腫。',
    icon: '🧂',
    gradient: 'from-rose-50 via-white to-orange-50',
    border: 'border-rose-200',
    keyPoints: ['加工食品、醬料、湯品常有隱藏鈉。', '少鹽有助血壓控制，對腎臟更友善。'],
    actions: ['先記住：鈉 2000mg/日（約鹽 5g）。', '用檸檬/香草/辛香料取代部分鹽與醬油。'],
  },
  {
    id: 'phosphorus',
    title: '低磷',
    subtitle: '維持血磷正常',
    hint: '血磷異常可能影響骨骼與血管健康。',
    icon: '🦴',
    gradient: 'from-violet-50 via-white to-indigo-50',
    border: 'border-violet-200',
    keyPoints: ['加工食品常含磷酸鹽添加物。', '血磷偏高與骨質/血管病變風險相關。'],
    actions: ['少吃加工食品、少喝可樂類。', '依抽血結果與醫囑調整最準。'],
  },
  {
    id: 'potassium',
    title: '低鉀',
    subtitle: '依尿量/血鉀調整',
    hint: '尿量偏少或血鉀偏高時，需要更留意鉀攝取。',
    icon: '🍌',
    gradient: 'from-emerald-50 via-white to-teal-50',
    border: 'border-emerald-200',
    keyPoints: ['鉀太高可能造成心律不整等危險。', '是否需要低鉀，取決於尿量與血鉀。'],
    actions: ['尿量 <1000 ml/day 或血鉀 >5.1 mEq/L：提高警覺。', '依醫師/營養師建議調整。'],
  },
]

export type LabelCard = {
  id: string
  name: string
  kcal: number
  proteinG: number
  sodiumMg: number
  potassiumMg: number
  correct: '鈉' | '鉀' | '蛋白質' | '熱量'
}

export const labelCards: LabelCard[] = [
  { id: 'a', name: '湯品（每份）', kcal: 90, proteinG: 3, sodiumMg: 850, potassiumMg: 120, correct: '鈉' },
  { id: 'b', name: '果汁（每份）', kcal: 130, proteinG: 1, sodiumMg: 15, potassiumMg: 420, correct: '鉀' },
  { id: 'c', name: '蛋白棒（每份）', kcal: 210, proteinG: 18, sodiumMg: 180, potassiumMg: 140, correct: '蛋白質' },
  { id: 'd', name: '餅乾（每份）', kcal: 260, proteinG: 4, sodiumMg: 320, potassiumMg: 80, correct: '熱量' },
]

type QuizState = 'idle' | 'wrong' | 'correct'
type LabelTarget = '鈉' | '鉀' | '蛋白質' | '熱量'

type Stage7SavedState = {
  activePrincipleId: DietPrincipleId | null
  visitedPrincipleIds: DietPrincipleId[]
  analyzer: {
    egfr: string
    upcr: string
    urineOutput: string
    potassium: string
    weight: string
    analyzed: boolean
  }
  labelGame: {
    roundIndex: number
    selectedCardId: string | null
    status: QuizState
    score: number
  }
  quiz: {
    selectedOption: string | null
  }
}

const labelTargets: LabelTarget[] = ['鈉', '鉀', '蛋白質', '熱量']

export function Stage7() {
  const navigate = useNavigate()
  const [isUnlocked, setIsUnlocked] = useState(false)
  const saved = getStageState<Stage7SavedState>('stage7')

  const [activePrincipleId, setActivePrincipleId] = useState<DietPrincipleId | null>(
    () => saved?.activePrincipleId ?? null,
  )
  const [visitedPrincipleIds, setVisitedPrincipleIds] = useState<DietPrincipleId[]>(
    () => saved?.visitedPrincipleIds ?? [],
  )

  const [egfr, setEgfr] = useState(() => saved?.analyzer.egfr ?? '')
  const [upcr, setUpcr] = useState(() => saved?.analyzer.upcr ?? '')
  const [urineOutput, setUrineOutput] = useState(() => saved?.analyzer.urineOutput ?? '')
  const [potassium, setPotassium] = useState(() => saved?.analyzer.potassium ?? '')
  const [weight, setWeight] = useState(() => saved?.analyzer.weight ?? '')
  const [hasAnalyzed, setHasAnalyzed] = useState(() => saved?.analyzer.analyzed ?? false)

  const [labelRoundIndex, setLabelRoundIndex] = useState(() => saved?.labelGame.roundIndex ?? 0)
  const [labelSelectedCardId, setLabelSelectedCardId] = useState<string | null>(
    () => saved?.labelGame.selectedCardId ?? null,
  )
  const [labelStatus, setLabelStatus] = useState<QuizState>(() => saved?.labelGame.status ?? 'idle')
  const [labelScore, setLabelScore] = useState(() => saved?.labelGame.score ?? 0)

  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(() => saved?.quiz.selectedOption ?? null)
  const [quizState, setQuizState] = useState<QuizState>('idle')
  const [quizError, setQuizError] = useState<string | null>(null)

  useEffect(() => {
    resolveLockedRedirectPath('stage7').then((path) => {
      if (path) navigate(path, { replace: true })
    })
  }, [navigate])

  useEffect(() => {
    getStageUnlocked('stage7').then((unlocked) => setIsUnlocked(unlocked))
  }, [])

  useEffect(() => {
    const state: Stage7SavedState = {
      activePrincipleId,
      visitedPrincipleIds,
      analyzer: { egfr, upcr, urineOutput, potassium, weight, analyzed: hasAnalyzed },
      labelGame: { roundIndex: labelRoundIndex, selectedCardId: labelSelectedCardId, status: labelStatus, score: labelScore },
      quiz: { selectedOption: selectedQuizOption },
    }
    setStageState<Stage7SavedState>('stage7', state)
  }, [
    activePrincipleId,
    visitedPrincipleIds,
    egfr,
    upcr,
    urineOutput,
    potassium,
    weight,
    hasAnalyzed,
    labelRoundIndex,
    labelSelectedCardId,
    labelStatus,
    labelScore,
    selectedQuizOption,
  ])

  const activePrinciple = useMemo(
    () => (activePrincipleId ? dietPrinciples.find((item) => item.id === activePrincipleId) ?? null : null),
    [activePrincipleId],
  )

  const wheelPositions = useMemo(() => {
    const radius = 180
    const size = dietPrinciples.length
    return dietPrinciples.map((principle, index) => {
      const angle = (Math.PI * 2 * index) / size - Math.PI / 2
      return {
        id: principle.id,
        left: `calc(50% + ${Math.cos(angle) * radius}px)`,
        top: `calc(50% + ${Math.sin(angle) * radius}px)`,
      }
    })
  }, [])

  const explorePercent = Math.round((visitedPrincipleIds.length / dietPrinciples.length) * 100)

  const labelTarget = labelTargets[labelRoundIndex % labelTargets.length]
  const labelRoundDone = labelRoundIndex >= labelTargets.length

  const analysis = useMemo(() => {
    if (!hasAnalyzed) return null

    const egfrNumber = Number(egfr)
    const upcrNumber = Number(upcr)
    const urineNumber = Number(urineOutput)
    const potassiumNumber = Number(potassium)
    const weightNumber = Number(weight)

    const meetsStartDiet = (Number.isFinite(egfrNumber) && egfrNumber > 0 && egfrNumber < 45) || (Number.isFinite(upcrNumber) && upcrNumber > 150)
    const needsLowPotassium =
      (Number.isFinite(urineNumber) && urineNumber > 0 && urineNumber < 1000) || (Number.isFinite(potassiumNumber) && potassiumNumber > 5.1)

    const proteinRange =
      Number.isFinite(weightNumber) && weightNumber > 0
        ? { min: Math.round(weightNumber * 0.6), max: Math.round(weightNumber * 0.8) }
        : null

    const kcalRange =
      Number.isFinite(weightNumber) && weightNumber > 0
        ? { min: Math.round(weightNumber * 30), max: Math.round(weightNumber * 35) }
        : null

    return { meetsStartDiet, needsLowPotassium, proteinRange, kcalRange }
  }, [egfr, upcr, urineOutput, potassium, weight, hasAnalyzed])

  const handleArrowClick = () => {
    if (isUnlocked) {
      navigate('/journey/stage8')
      return
    }
    setQuizState('idle')
    setQuizError(null)
    setSelectedQuizOption(null)
    setIsQuizOpen(true)
  }

  const submitQuiz = async () => {
    setQuizError(null)
    if (!selectedQuizOption) {
      setQuizError('請先選擇一個答案。')
      return
    }

    if (selectedQuizOption !== 'egfr_or_upcr') {
      setQuizState('wrong')
      setQuizError('答案不正確，請再試一次。')
      return
    }

    await setStageUnlocked('stage7', true)
    setIsUnlocked(true)
    setQuizState('correct')
  }

  const submitLabelRound = () => {
    if (!labelSelectedCardId) return
    const card = labelCards.find((item) => item.id === labelSelectedCardId)
    if (!card) return

    if (card.correct !== labelTarget) {
      setLabelStatus('wrong')
      return
    }

    if (labelStatus !== 'correct') setLabelScore((prev) => prev + 1)
    setLabelStatus('correct')
  }

  const nextLabelRound = () => {
    setLabelRoundIndex((prev) => prev + 1)
    setLabelSelectedCardId(null)
    setLabelStatus('idle')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 py-16 px-4 text-slate-800 relative overflow-hidden">
      <Button
        variant="ghost"
        onClick={() => navigate('/journey/stage6')}
        className="fixed top-20 left-4 z-30 bg-white/70 backdrop-blur border border-white hover:bg-white shadow-sm"
      >
        ← 回到上一關
      </Button>

      <button
        aria-label={isUnlocked ? '前往下一關' : '解鎖下一關'}
        onClick={handleArrowClick}
        className={`fixed top-1/2 right-4 -translate-y-1/2 z-30 flex flex-col items-center gap-2 rounded-3xl px-4 py-5 shadow-xl transition-all duration-200 cursor-pointer ${
          isUnlocked
            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
            : 'bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-600'
        }`}
      >
        <span className="text-2xl">{isUnlocked ? '🔓' : '🔒'}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M13.172 12 8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
        </svg>
      </button>

      <div className="max-w-6xl mx-auto space-y-10">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.4em] text-rose-500">Stage 07 / 飲食迷思站</p>
          <h1 className="text-3xl font-black text-rose-800">吃對方法，比少吃更重要</h1>
          <p className="text-slate-600">
            點選「五大飲食任務」了解原則，玩一輪「營養標示偵探」，最後用右側鎖頭完成測驗解鎖下一關。
          </p>
        </header>

        <section className="bg-white rounded-3xl shadow-lg p-8 border border-rose-100 space-y-8">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-start">
            <div className="space-y-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">五大飲食任務</p>
                  <h2 className="text-xl font-semibold text-slate-900 mt-2">點一個任務，解鎖一個重點</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">探索進度</p>
                  <p className="text-lg font-black text-slate-900">{explorePercent}%</p>
                </div>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-rose-400 transition-all duration-500" style={{ width: `${explorePercent}%` }} />
              </div>

              <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-rose-50/60 p-6">
                <div className="relative mx-auto h-[440px] w-[440px] max-w-full">
                  <div className="absolute inset-0 rounded-full border border-rose-100 bg-white/80 shadow-inner" />
                  <div className="absolute left-1/2 top-1/2 h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-orange-50 shadow-sm flex flex-col items-center justify-center text-center px-6">
                    <div className="text-4xl">🍽️</div>
                    <p className="mt-2 text-sm uppercase tracking-[0.35em] text-slate-500">Diet Mission</p>
                    <p className="mt-2 text-lg font-black text-slate-900">飲食迷思站</p>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                      點外圈任務卡，右側會出現詳細內容。
                    </p>
                  </div>

                  {wheelPositions.map((position, index) => {
                    const principle = dietPrinciples[index]
                    const active = principle.id === activePrincipleId
                    const visited = visitedPrincipleIds.includes(principle.id)
                    return (
                      <button
                        key={principle.id}
                        onClick={() => {
                          setActivePrincipleId(principle.id)
                          if (!visited) setVisitedPrincipleIds((prev) => [...prev, principle.id])
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 w-40 rounded-3xl border-2 p-4 text-left shadow-md transition-all hover:-translate-y-[calc(50%+2px)] hover:shadow-lg cursor-pointer ${
                          active ? `${principle.border} bg-gradient-to-br ${principle.gradient}` : 'border-slate-200 bg-white hover:border-rose-200'
                        }`}
                        style={{ left: position.left, top: position.top }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Task</p>
                            <p className="text-sm font-black text-slate-900 mt-1">{principle.title}</p>
                            <p className="text-xs text-slate-600 mt-1">{principle.subtitle}</p>
                          </div>
                          <div className="text-xl">{principle.icon}</div>
                        </div>
                        <div className="mt-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                              visited ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {visited ? '已閱讀' : '未閱讀'}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-rose-100 bg-linear-to-br from-rose-50 to-white p-5 shadow-inner space-y-2">
                <p className="text-xs uppercase tracking-[0.35em] text-rose-600 font-semibold">開始飲食調整的條件</p>
                <p className="text-sm text-slate-700">
                  eGFR <span className="font-semibold">45</span> ml/min/1.73m² 或 UPCR <span className="font-semibold">&gt; 150</span>{' '}
                  （需依個別情況調整）
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">任務說明</p>
                    <h3 className="text-lg font-black text-slate-900 mt-2">{activePrinciple?.title ?? '請先點選一個任務卡'}</h3>
                    {activePrinciple && <p className="text-sm text-slate-600 mt-2">{activePrinciple.hint}</p>}
                  </div>
                  <div className="text-3xl">{activePrinciple?.icon ?? '🧩'}</div>
                </div>

                {activePrinciple ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">重點</p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700 list-disc pl-5">
                        {activePrinciple.keyPoints.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">你可以這樣做</p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700 list-disc pl-5">
                        {activePrinciple.actions.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                    先從「低蛋白」或「鹽分控制」開始最有感。
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">快速分析</p>
                  <h3 className="text-lg font-black text-slate-900 mt-2">我需要開始腎臟病飲食調整嗎？</h3>
                  <p className="text-sm text-slate-600 mt-2">填完後按「查看結果」才會更新右側分析。</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm text-slate-700">
                    <span className="text-xs text-slate-500">eGFR</span>
                    <input
                      value={egfr}
                      onChange={(e) => {
                        setEgfr(e.target.value)
                        setHasAnalyzed(false)
                      }}
                      inputMode="decimal"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                      placeholder="例如 42"
                    />
                  </label>
                  <label className="space-y-1 text-sm text-slate-700">
                    <span className="text-xs text-slate-500">UPCR</span>
                    <input
                      value={upcr}
                      onChange={(e) => {
                        setUpcr(e.target.value)
                        setHasAnalyzed(false)
                      }}
                      inputMode="decimal"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                      placeholder="例如 180"
                    />
                  </label>
                  <label className="space-y-1 text-sm text-slate-700">
                    <span className="text-xs text-slate-500">體重（公斤，可選）</span>
                    <input
                      value={weight}
                      onChange={(e) => {
                        setWeight(e.target.value)
                        setHasAnalyzed(false)
                      }}
                      inputMode="decimal"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                      placeholder="例如 60"
                    />
                  </label>
                  <label className="space-y-1 text-sm text-slate-700">
                    <span className="text-xs text-slate-500">前一天尿量（ml，可選）</span>
                    <input
                      value={urineOutput}
                      onChange={(e) => {
                        setUrineOutput(e.target.value)
                        setHasAnalyzed(false)
                      }}
                      inputMode="decimal"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                      placeholder="例如 900"
                    />
                  </label>
                  <label className="space-y-1 text-sm text-slate-700 sm:col-span-2">
                    <span className="text-xs text-slate-500">血鉀 K（mEq/L，可選）</span>
                    <input
                      value={potassium}
                      onChange={(e) => {
                        setPotassium(e.target.value)
                        setHasAnalyzed(false)
                      }}
                      inputMode="decimal"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                      placeholder="例如 5.3"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    onClick={() => setHasAnalyzed(true)}
                    className="bg-rose-500 hover:bg-rose-600 text-white px-6 cursor-pointer"
                  >
                    查看結果
                  </Button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                  {!analysis ? (
                    <p className="text-slate-600">尚未查看結果。</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-900">
                        {analysis.meetsStartDiet ? '符合開始飲食調整條件' : '未達開始飲食調整條件'}
                      </p>
                      {analysis.proteinRange && (
                        <p className="text-slate-700">
                          低蛋白參考：<span className="font-semibold">{analysis.proteinRange.min}～{analysis.proteinRange.max} g/日</span>（0.6～0.8 g/kg）
                        </p>
                      )}
                      {analysis.kcalRange && (
                        <p className="text-slate-700">
                          熱量參考：<span className="font-semibold">{analysis.kcalRange.min}～{analysis.kcalRange.max} kcal/日</span>（30～35 kcal/kg）
                        </p>
                      )}
                      <p className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${analysis.needsLowPotassium ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {analysis.needsLowPotassium ? '需要留意鉀：尿量偏少或血鉀偏高' : '鉀：未偵測到需要特別留意的條件'}
                      </p>
                      <p className="text-xs text-slate-500">僅供學習與自我檢視，仍需依醫師/營養師建議調整。</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">小遊戲</p>
                    <h3 className="text-lg font-black text-slate-900 mt-2">營養標示偵探</h3>
                    <p className="text-sm text-slate-600 mt-2">選一張卡，再按「確認答案」。答錯不給提示，重來一次就好。</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">得分</p>
                    <p className="text-lg font-black text-slate-900">{labelScore}/{labelTargets.length}</p>
                  </div>
                </div>

                {!labelRoundDone ? (
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                      第 {labelRoundIndex + 1} 題：哪一張最需要注意「<span className="font-semibold">{labelTarget}</span>」？
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {labelCards.map((card) => {
                        const selected = card.id === labelSelectedCardId
                        return (
                          <button
                            key={card.id}
                            onClick={() => {
                              setLabelSelectedCardId(card.id)
                              setLabelStatus('idle')
                            }}
                            className={`rounded-3xl border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${
                              selected ? 'border-rose-400 bg-rose-50' : 'border-slate-200 bg-white hover:border-rose-200'
                            }`}
                          >
                            <p className="text-sm font-black text-slate-900">{card.name}</p>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                              <p>熱量：<span className="font-semibold text-slate-900">{card.kcal}</span> kcal</p>
                              <p>蛋白質：<span className="font-semibold text-slate-900">{card.proteinG}</span> g</p>
                              <p>鈉：<span className="font-semibold text-slate-900">{card.sodiumMg}</span> mg</p>
                              <p>鉀：<span className="font-semibold text-slate-900">{card.potassiumMg}</span> mg</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {labelStatus === 'wrong' && (
                      <p className="text-sm text-rose-600">答案不正確，請再試一次。</p>
                    )}
                    {labelStatus === 'correct' && (
                      <p className="text-sm text-emerald-700">答對了！可以進入下一題。</p>
                    )}

                    <div className="flex justify-end gap-2">
                      {labelStatus !== 'correct' ? (
                        <Button
                          onClick={submitLabelRound}
                          disabled={!labelSelectedCardId}
                          className="bg-rose-500 hover:bg-rose-600 text-white px-6 cursor-pointer"
                        >
                          確認答案
                        </Button>
                      ) : (
                        <Button
                          onClick={nextLabelRound}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 cursor-pointer"
                        >
                          下一題
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                    你已完成所有題目！得分 {labelScore}/{labelTargets.length}。
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {isQuizOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-lg w-full space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-500">Stage 7 解鎖測驗</p>
            <h3 className="text-xl font-semibold text-slate-900">下列哪個條件符合「開始腎臟病飲食調整」的門檻？</h3>
            <div className="space-y-3">
              {[
                { label: 'eGFR ≥ 90', value: 'egfr_90' },
                { label: 'UPCR ≤ 150', value: 'upcr_150' },
                { label: 'eGFR < 60（只要小於 60 就一定要開始）', value: 'egfr_60' },
                { label: 'eGFR < 45 或 UPCR > 150', value: 'egfr_or_upcr' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 rounded-2xl border p-3 cursor-pointer transition-colors ${
                    selectedQuizOption === option.value
                      ? 'border-rose-400 bg-rose-50 text-rose-800'
                      : 'border-slate-200 hover:border-rose-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="stage7-quiz"
                    className="h-4 w-4 border-slate-300 text-rose-500 focus:ring-rose-400"
                    checked={selectedQuizOption === option.value}
                    onChange={() => setSelectedQuizOption(option.value)}
                  />
                  <span className="font-medium">{option.label}</span>
                </label>
              ))}
            </div>
            {quizError && <p className="text-sm text-rose-600">{quizError}</p>}
            {quizState === 'correct' && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                解鎖成功！你可以按「進入下一關」繼續闖關。
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setIsQuizOpen(false)} className="cursor-pointer">
                關閉
              </Button>
              {quizState !== 'correct' && (
                <Button onClick={() => void submitQuiz()} className="bg-rose-500 hover:bg-rose-600 text-white px-6 cursor-pointer">
                  確認答案
                </Button>
              )}
              {quizState === 'correct' && (
                <Button
                  onClick={() => navigate('/journey/stage8')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 cursor-pointer"
                >
                  進入下一關
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}