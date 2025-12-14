import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { getStageUnlocked, setStageUnlocked } from '../lib/journeyProgress'

type TrioTopic = {
  id: 'bp' | 'sugar' | 'lipid'
  title: string
  subtitle: string
  body: string
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
    icon: '🩺',
    gradient: 'from-rose-50 via-white to-orange-50',
    border: 'border-rose-200',
  },
  {
    id: 'sugar',
    title: '高血糖',
    subtitle: '傷害微血管、蛋白尿風險增加',
    body: '高血糖會損傷腎臟的微血管，導致蛋白尿增加，加速腎臟功能衰退。',
    icon: '🍬',
    gradient: 'from-sky-50 via-white to-cyan-50',
    border: 'border-sky-200',
  },
  {
    id: 'lipid',
    title: '高血脂',
    subtitle: '影響濾過功能、惡化更快',
    body: '高血脂會影響腎臟的濾過功能，可能讓腎臟病惡化更迅速。',
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

type TargetStatus = 'done' | 'notyet' | 'try'

const statusLabel: Record<TargetStatus, string> = {
  done: '我有做到',
  notyet: '尚未做到',
  try: '將努力做到',
}

export function Stage6() {
  const navigate = useNavigate()
  const [isUnlocked, setIsUnlockedState] = useState(false)
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [quizState, setQuizState] = useState<'idle' | 'wrong' | 'correct'>('idle')

  const [activeTopicId, setActiveTopicId] = useState<TrioTopic['id']>('bp')
  const [visitedTopicIds, setVisitedTopicIds] = useState<TrioTopic['id'][]>(['bp'])
  const [targetStatus, setTargetStatus] = useState<Record<string, TargetStatus>>(() =>
    Object.fromEntries(targetItems.map((item) => [item.id, 'try'])) as Record<string, TargetStatus>
  )

  useEffect(() => {
    getStageUnlocked('stage6').then((unlocked) => setIsUnlockedState(unlocked))
  }, [])

  const activeTopic = useMemo(() => trioTopics.find((item) => item.id === activeTopicId)!, [activeTopicId])
  const explorePercent = Math.round((visitedTopicIds.length / trioTopics.length) * 100)

  const doneCount = useMemo(
    () => Object.values(targetStatus).filter((value) => value === 'done').length,
    [targetStatus]
  )
  const donePercent = Math.round((doneCount / targetItems.length) * 100)

  const handleArrowClick = () => {
    if (!isUnlocked) {
      setQuizState('idle')
      setIsQuizOpen(true)
      return
    }
    navigate('/journey')
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
          <p className="text-slate-600">點選三高卡片了解影響，並試著勾選「你目前想先達成的目標值」。</p>
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
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-500">慢性腎臟病患者</p>
                    <h2 className="text-xl font-semibold text-slate-900 mt-2">控制目標值（自我盤點）</h2>
                    <p className="text-sm text-slate-600 mt-1">每項先選一個狀態，看看你目前做到幾項。</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">達標項目</p>
                    <p className="text-lg font-black text-slate-900">
                      {doneCount}/{targetItems.length}
                    </p>
                  </div>
                </div>

                <div className="h-2 rounded-full bg-white overflow-hidden border border-slate-100">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${donePercent}%` }} />
                </div>

                <div className="space-y-3">
                  {targetItems.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-600">{item.detail}</p>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {(Object.keys(statusLabel) as TargetStatus[]).map((key) => {
                          const active = targetStatus[item.id] === key
                          return (
                            <button
                              key={key}
                              onClick={() => setTargetStatus((prev) => ({ ...prev, [item.id]: key }))}
                              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-sm ${
                                active
                                  ? key === 'done'
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                    : key === 'notyet'
                                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                                      : 'border-amber-200 bg-amber-50 text-amber-800'
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
                <button
                  key={opt.id}
                  onClick={() => {
                    const correct = opt.id === 'a'
                    if (!correct) {
                      setQuizState('wrong')
                      return
                    }
                    setQuizState('correct')
                    void setStageUnlocked('stage6', true)
                    setIsUnlockedState(true)
                  }}
                  className="w-full text-left rounded-2xl border border-slate-200 bg-white px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-rose-200 cursor-pointer"
                >
                  <span className="font-semibold text-slate-900">{opt.label}</span>
                </button>
              ))}
            </div>

            {quizState === 'wrong' && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">答錯，請再試一次。</div>
            )}

            {quizState === 'correct' && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                解鎖成功！再點右側箭頭即可前往下一關（尚未完成的關卡會先回到闖關地圖）。
              </div>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <Button variant="ghost" onClick={() => setIsQuizOpen(false)}>
                關閉
              </Button>
              {quizState === 'correct' && (
                <Button onClick={() => navigate('/journey')} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6">
                  回到闖關地圖
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

