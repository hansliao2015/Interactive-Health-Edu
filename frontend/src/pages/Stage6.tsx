import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { getStageUnlocked, setStageUnlocked } from '../lib/journeyProgress'
import { resolveLockedRedirectPath } from '../lib/journeyGuard'
import { getStageState, setStageState } from '../lib/stageState'

type TrioTopic = {
  id: 'bp' | 'sugar' | 'lipid'
  title: string
  subtitle: string
  body: string
  keyPoints: string[]
  actions: string[]
  extraTip: string
  icon: string
  gradient: string
  border: string
}

const trioTopics: TrioTopic[] = [
  {
    id: 'bp',
    title: '高血壓',
    subtitle: '讓腎臟小血管壓力上升',
    body: '高血壓會增加腎臟小血管的壓力，導致腎臟組織受損，進而影響腎功能。',
    keyPoints: [
      '血壓長期偏高會讓腎絲球處在「高壓工作」狀態，濾過單位更容易受傷。',
      '腎臟一旦受損，調節血壓的能力也會變差，形成惡性循環。',
      '很多人早期沒有明顯症狀，定期量測更重要。',
    ],
    actions: [
      '固定時間量血壓並記錄（早/晚各一次最常用）。',
      '減少鹽分與加工食品，避免重口味湯品。',
      '規律運動、維持體重；依醫師指示規律用藥。',
    ],
    extraTip: '如果你常頭痛、胸悶或視線模糊，請更留意血壓是否偏高（有症狀也要就醫評估）。',
    icon: '🩺',
    gradient: 'from-rose-50 via-white to-orange-50',
    border: 'border-rose-200',
  },
  {
    id: 'sugar',
    title: '高血糖',
    subtitle: '傷害微血管、蛋白尿風險增加',
    body: '高血糖會損傷腎臟的微血管，導致蛋白尿增加，加速腎臟功能衰退。',
    keyPoints: [
      '血糖波動大會讓微血管內皮受損，腎臟「濾網」變得更容易漏蛋白。',
      '蛋白尿一旦出現，代表腎臟已受到壓力，追蹤更重要。',
      '血糖控制穩定可延緩腎臟惡化速度。',
    ],
    actions: [
      '配合醫囑追蹤 HbA1c（反映近 3 個月平均血糖）。',
      '調整飲食：少含糖飲、少精緻澱粉，分配三餐與點心。',
      '規律運動與體重管理，並按時用藥/施打胰島素。',
    ],
    extraTip: '你可以把「飯後 2 小時」血糖也記起來，常能更快看出飲食造成的影響。',
    icon: '🍬',
    gradient: 'from-sky-50 via-white to-cyan-50',
    border: 'border-sky-200',
  },
  {
    id: 'lipid',
    title: '高血脂',
    subtitle: '影響濾過功能、惡化更快',
    body: '高血脂會影響腎臟的濾過功能，可能讓腎臟病惡化更迅速。',
    keyPoints: [
      '血脂偏高會增加動脈硬化風險，腎臟血流供應可能受影響。',
      '腎臟病患者若合併血脂異常，心血管風險也會一起上升。',
      '改善血脂常需要「飲食 + 運動 + 藥物」並行。',
    ],
    actions: [
      '少油炸、少反式脂肪；多選擇蒸/煮/烤。',
      '增加蔬菜與高纖食物，點心改成無糖優格或水果。',
      '依醫師指示規律用藥，並定期抽血追蹤。',
    ],
    extraTip: '如果你同時有三高中的兩項以上，越需要建立「固定追蹤 + 紀錄」的習慣。',
    icon: '🫀',
    gradient: 'from-amber-50 via-white to-rose-50',
    border: 'border-amber-200',
  },
]

type TargetItem = {
  id: string
  title: string
  detail: string
}

const targetItems: TargetItem[] = [
  { id: 'bp', title: '血壓', detail: '< 130 / 80 mmHg' },
  { id: 'sugar', title: '糖化血色素（HbA1c）', detail: '< 7%' },
  { id: 'tc', title: '總膽固醇', detail: '< 200 mg/dl' },
  { id: 'tg', title: '三酸甘油脂', detail: '< 150 mg/dl' },
  { id: 'hdl', title: '高密度脂蛋白膽固醇（HDL）', detail: '男 ≥ 55 / 女 ≥ 60 mg/dl' },
  { id: 'ldl', title: '低密度脂蛋白膽固醇（LDL）', detail: '< 100 mg/dl' },
  { id: 'habit', title: '自我保健', detail: '戒菸、減少鹽分、維持理想體重、規律運動' },
]

type TargetStatus = 'done' | 'pending'

const statusLabel: Record<TargetStatus, string> = {
  done: '我有做到',
  pending: '尚未做到，將努力做到',
}

export function Stage6() {
  const navigate = useNavigate()

  type Stage6State = {
    activeTopicId: TrioTopic['id'] | null
    visitedTopicIds: TrioTopic['id'][]
    targetStatus: Record<string, TargetStatus | null>
    selectedQuizOption: string | null
  }

  const saved = getStageState<Stage6State>('stage6')
  const [isUnlocked, setIsUnlockedState] = useState(false)
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [quizState, setQuizState] = useState<'idle' | 'wrong' | 'correct'>('idle')
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(() => saved?.selectedQuizOption ?? null)
  const [quizError, setQuizError] = useState<string | null>(null)

  const [activeTopicId, setActiveTopicId] = useState<TrioTopic['id'] | null>(() => saved?.activeTopicId ?? null)
  const [visitedTopicIds, setVisitedTopicIds] = useState<TrioTopic['id'][]>(() =>
    Array.isArray(saved?.visitedTopicIds) ? saved.visitedTopicIds : []
  )
  const [targetStatus, setTargetStatus] = useState<Record<string, TargetStatus | null>>(() => {
    const base = Object.fromEntries(targetItems.map((item) => [item.id, null])) as Record<string, TargetStatus | null>
    if (!saved?.targetStatus || typeof saved.targetStatus !== 'object') return base
    for (const item of targetItems) {
      const value = (saved.targetStatus as Record<string, unknown>)[item.id]
      if (value === 'done' || value === 'pending' || value === null) base[item.id] = value as TargetStatus | null
    }
    return base
  })

  useEffect(() => {
    resolveLockedRedirectPath('stage6').then((path) => {
      if (path) navigate(path, { replace: true })
    })
  }, [navigate])

  useEffect(() => {
    getStageUnlocked('stage6').then((unlocked) => setIsUnlockedState(unlocked))
  }, [])

  useEffect(() => {
    setStageState<Stage6State>('stage6', { activeTopicId, visitedTopicIds, targetStatus, selectedQuizOption })
  }, [activeTopicId, selectedQuizOption, targetStatus, visitedTopicIds])

  const activeTopic = useMemo(
    () => (activeTopicId ? trioTopics.find((item) => item.id === activeTopicId) ?? null : null),
    [activeTopicId],
  )
  const explorePercent = Math.round((visitedTopicIds.length / trioTopics.length) * 100)

  const doneCount = useMemo(
    () => Object.values(targetStatus).filter((value) => value === 'done').length,
    [targetStatus]
  )
  const filledCount = useMemo(() => Object.values(targetStatus).filter((value) => value !== null).length, [targetStatus])
  const filledPercent = Math.round((filledCount / targetItems.length) * 100)

  const score = doneCount
  const scoreLabel = useMemo(() => {
    if (score >= 6) return { label: '很棒', tone: 'bg-emerald-100 text-emerald-700' }
    if (score >= 4) return { label: '不錯', tone: 'bg-amber-100 text-amber-800' }
    if (score >= 2) return { label: '起步中', tone: 'bg-orange-100 text-orange-800' }
    return { label: '再加油', tone: 'bg-slate-100 text-slate-600' }
  }, [score])

  const handleArrowClick = () => {
    if (!isUnlocked) {
      setQuizState('idle')
      setSelectedQuizOption(null)
      setQuizError(null)
      setIsQuizOpen(true)
      return
    }
    navigate('/journey/stage7')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 py-16 px-4 text-slate-800 relative overflow-hidden">
      <Button
        variant="ghost"
        onClick={() => navigate('/journey/stage5')}
        className="fixed top-20 left-4 z-30 bg-white/70 backdrop-blur border border-white hover:bg-white shadow-sm"
      >
        ← 回到上一關
      </Button>

      <button
        aria-label={isUnlocked ? '前往下一關' : '解鎖下一關'}
        onClick={handleArrowClick}
        className={`fixed top-1/2 right-4 -translate-y-1/2 z-30 flex flex-col items-center gap-2 rounded-3xl px-4 py-5 shadow-xl transition-all duration-200 ${
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
          <p className="text-sm uppercase tracking-[0.4em] text-rose-500">Stage 06 / 三高控制好，腎臟才有保</p>
          <h1 className="text-3xl font-black text-rose-800">看懂三高，才能守住腎臟</h1>
          <p className="text-slate-600">點選三高卡片了解影響，並完成右側的「自我盤點」來整理目前狀況。</p>
        </header>

        <section className="bg-white rounded-3xl shadow-lg p-8 border border-rose-100 space-y-8">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] items-start">
            <div className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">三高與腎臟病的關係</p>
                  <h2 className="text-xl font-semibold text-slate-900 mt-2">點一張卡，看一個重點</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">探索進度</p>
                  <p className="text-lg font-black text-slate-900">{explorePercent}%</p>
                </div>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-rose-400 transition-all duration-500" style={{ width: `${explorePercent}%` }} />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {trioTopics.map((topic) => {
                  const active = topic.id === activeTopicId
                  const visited = visitedTopicIds.includes(topic.id)
                  return (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setActiveTopicId(topic.id)
                        if (!visited) setVisitedTopicIds((prev) => [...prev, topic.id])
                      }}
                      className={`group rounded-3xl border-2 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${
                        active ? `${topic.border} bg-gradient-to-br ${topic.gradient}` : 'border-slate-200 bg-white hover:border-rose-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Topic</p>
                          <p className="text-lg font-black text-slate-900 mt-1">{topic.title}</p>
                          <p className="text-xs text-slate-600 mt-1">{topic.subtitle}</p>
                        </div>
                        <div className="text-2xl">{topic.icon}</div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            visited ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {visited ? '已看過' : '未探索'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {activeTopic ? (
                <div className={`rounded-3xl border ${activeTopic.border} bg-gradient-to-br ${activeTopic.gradient} p-6 shadow-inner`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.4em] text-slate-500">重點摘要</p>
                      <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <span className="text-2xl">{activeTopic.icon}</span>
                        <span>{activeTopic.title}</span>
                      </h3>
                      <p className="text-sm text-slate-700 leading-relaxed">{activeTopic.body}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
                      <p className="text-sm font-semibold text-slate-900">你需要知道</p>
                      <ul className="mt-2 list-disc pl-5 space-y-1.5 text-sm text-slate-700">
                        {activeTopic.keyPoints.map((text) => (
                          <li key={text}>{text}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
                      <p className="text-sm font-semibold text-slate-900">你可以怎麼做</p>
                      <ul className="mt-2 list-disc pl-5 space-y-1.5 text-sm text-slate-700">
                        {activeTopic.actions.map((text) => (
                          <li key={text}>{text}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white/70 p-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">小提醒</p>
                    <p className="mt-1 leading-relaxed">{activeTopic.extraTip}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-inner">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">重點摘要</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">先選一張三高卡片</p>
                  <p className="mt-1 text-sm text-slate-600">點選上方任一張卡，這裡才會顯示詳細說明。</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-500">慢性腎臟病患者</p>
                    <h2 className="text-xl font-semibold text-slate-900 mt-2">控制目標值（自我盤點）</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <div
                      className="relative h-14 w-14 rounded-full"
                      style={{
                        background: `conic-gradient(#10b981 ${filledPercent}%, #e2e8f0 0)`,
                      }}
                      aria-label={`已完成自我盤點 ${filledPercent}%`}
                    >
                      <div className="absolute inset-1 rounded-full bg-white grid place-items-center shadow-sm">
                        <span className="text-xs font-black text-slate-900">{filledPercent}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">已完成盤點</p>
                      <p className="text-lg font-black text-slate-900">
                        {filledCount}/{targetItems.length}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">其中「我有做到」{doneCount} 項</p>
                    </div>
                  </div>
                </div>

                <div className="h-2 rounded-full bg-white overflow-hidden border border-slate-100">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${filledPercent}%` }} />
                </div>

                <div className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">目前分數</p>
                      <p className="mt-1 text-3xl font-black text-slate-900">{score}/7</p>
                      <p className="mt-1 text-xs text-slate-500">計分方式：每個「我有做到」 = 1 分（滿分 {targetItems.length} 分）</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${scoreLabel.tone}`}>
                      {scoreLabel.label}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {targetItems.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-600">{item.detail}</p>
                      </div>
                      <div className="mt-2 text-xs">
                        {targetStatus[item.id] === null ? (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                            未選擇
                          </span>
                        ) : targetStatus[item.id] === 'done' ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">
                            我有做到
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-1 font-semibold text-rose-700">
                            尚未做到，將努力做到
                          </span>
                        )}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {(Object.keys(statusLabel) as TargetStatus[]).map((key) => {
                          const active = targetStatus[item.id] === key
                          return (
                            <button
                              key={key}
                              onClick={(e) => {
                                e.stopPropagation()
                                setTargetStatus((prev) => ({ ...prev, [item.id]: key }))
                              }}
                              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-sm ${
                                active
                                  ? key === 'done'
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                    : 'border-rose-200 bg-rose-50 text-rose-700'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-rose-200'
                              }`}
                            >
                              {statusLabel[key]}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {isQuizOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-500">Stage 6 問題</p>
            <h3 className="text-xl font-semibold text-slate-900">解鎖下一關</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              題目：三高之中，哪一項會增加腎臟小血管的壓力，導致腎臟組織受損？
            </p>

            <div className="grid gap-2">
              {[
                { id: 'a', label: '高血壓' },
                { id: 'b', label: '高血糖' },
                { id: 'c', label: '高血脂' },
                { id: 'd', label: '以上皆無' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 rounded-2xl border p-3 cursor-pointer transition-colors ${
                    selectedQuizOption === opt.id ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200 hover:border-rose-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="quiz6"
                    value={opt.id}
                    className="sr-only"
                    checked={selectedQuizOption === opt.id}
                    onChange={(e) => {
                      setSelectedQuizOption(e.target.value)
                      setQuizState('idle')
                      setQuizError(null)
                    }}
                  />
                  <span className="font-semibold text-slate-900">{opt.label}</span>
                </label>
              ))}
            </div>

            {quizError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{quizError}</div>
            )}

            {quizState === 'correct' && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                解鎖成功！你可以按「進入下一關」繼續闖關。
              </div>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <Button variant="ghost" onClick={() => setIsQuizOpen(false)}>
                關閉
              </Button>
              {quizState !== 'correct' && (
                <Button
                  onClick={() => {
                    if (!selectedQuizOption) {
                      setQuizError('請先選擇答案')
                      return
                    }
                    if (selectedQuizOption === 'a') {
                      setQuizState('correct')
                      setQuizError(null)
                      void setStageUnlocked('stage6', true)
                      setIsUnlockedState(true)
                      return
                    }
                    setQuizState('wrong')
                    setQuizError('答案不正確，再試一次。')
                  }}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-6"
                >
                  確認答案
                </Button>
              )}
              {quizState === 'correct' && (
                <Button onClick={() => navigate('/journey/stage7')} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6">
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
