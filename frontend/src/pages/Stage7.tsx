import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { getStageUnlocked, setStageUnlocked } from '../lib/journeyProgress'
import { resolveLockedRedirectPath } from '../lib/journeyGuard'

type Topic = {
  id: 'protein' | 'salt' | 'phosphorus'
  title: string
  subtitle: string
  points: string[]
  icon: string
  gradient: string
  border: string
}

const topics: Topic[] = [
  {
    id: 'protein',
    title: '蛋白質',
    subtitle: '吃對份量與來源',
    points: ['優先選擇高品質蛋白（例如：蛋、魚、瘦肉）。', '份量依醫師/營養師建議調整，不盲目「越多越好」。', '若有蛋白尿或腎功能下降，更要按指示控制。'],
    icon: '🥚',
    gradient: 'from-rose-50 via-white to-orange-50',
    border: 'border-rose-200',
  },
  {
    id: 'salt',
    title: '鹽分（鈉）',
    subtitle: '少鹽能幫忙控血壓',
    points: ['少鹽能降低水腫與血壓負擔。', '避免加工食品（泡麵、香腸、醃漬物）與重口味醬料。', '用檸檬、胡椒、香草取代部分鹽與醬油。'],
    icon: '🧂',
    gradient: 'from-sky-50 via-white to-cyan-50',
    border: 'border-sky-200',
  },
  {
    id: 'phosphorus',
    title: '磷',
    subtitle: '看懂「隱藏磷」',
    points: ['含磷添加物常藏在加工食品中。', '少喝可樂類、少吃加工肉品。', '若醫師開立磷結合劑請依指示服用。'],
    icon: '🥤',
    gradient: 'from-amber-50 via-white to-rose-50',
    border: 'border-amber-200',
  },
]

export function Stage7() {
  const navigate = useNavigate()
  const [isUnlocked, setIsUnlockedState] = useState(false)
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [quizState, setQuizState] = useState<'idle' | 'wrong' | 'correct'>('idle')
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null)
  const [quizError, setQuizError] = useState<string | null>(null)

  const [activeTopicId, setActiveTopicId] = useState<Topic['id']>('salt')
  const [visitedIds, setVisitedIds] = useState<Topic['id'][]>(['salt'])

  useEffect(() => {
    resolveLockedRedirectPath('stage7').then((path) => {
      if (path) navigate(path, { replace: true })
    })
  }, [navigate])

  useEffect(() => {
    getStageUnlocked('stage7').then((unlocked) => setIsUnlockedState(unlocked))
  }, [])

  const activeTopic = useMemo(() => topics.find((topic) => topic.id === activeTopicId)!, [activeTopicId])
  const explorePercent = Math.round((visitedIds.length / topics.length) * 100)

  const handleArrowClick = () => {
    if (!isUnlocked) {
      setQuizState('idle')
      setSelectedQuizOption(null)
      setQuizError(null)
      setIsQuizOpen(true)
      return
    }
    navigate('/journey')
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
          <p className="text-sm uppercase tracking-[0.4em] text-rose-500">Stage 07 / 飲食迷失站</p>
          <h1 className="text-3xl font-black text-rose-800">用三個按鈕先抓住重點</h1>
          <p className="text-slate-600">點選不同飲食主題，完成探索後再用小測驗解鎖下一段旅程。</p>
        </header>

        <section className="bg-white rounded-3xl shadow-lg p-8 border border-rose-100 space-y-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">互動導覽</p>
              <h2 className="text-xl font-semibold text-slate-900 mt-2">選一個主題，看一組提醒</h2>
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
            {topics.map((topic) => {
              const active = topic.id === activeTopicId
              const visited = visitedIds.includes(topic.id)
              return (
                <button
                  key={topic.id}
                  onClick={() => {
                    setActiveTopicId(topic.id)
                    if (!visited) setVisitedIds((prev) => [...prev, topic.id])
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

          <div className={`rounded-3xl border ${activeTopic.border} bg-gradient-to-br ${activeTopic.gradient} p-6 shadow-inner space-y-3`}>
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <span className="text-2xl">{activeTopic.icon}</span>
                <span>{activeTopic.title}</span>
              </h3>
              <span className="text-xs text-slate-500">提示卡</span>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
              {activeTopic.points.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {isQuizOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-500">Stage 7 問題</p>
            <h3 className="text-xl font-semibold text-slate-900">解鎖下一關</h3>
            <p className="text-sm text-slate-600 leading-relaxed">題目：以下哪一項最能幫助控制血壓與減少水腫負擔？</p>

            <div className="grid gap-2">
              {[
                { id: 'a', label: '增加鹽分攝取' },
                { id: 'b', label: '少鹽飲食、減少加工食品' },
                { id: 'c', label: '每天喝含糖飲料補水' },
                { id: 'd', label: '越重口味越開胃' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 rounded-2xl border p-3 cursor-pointer transition-colors ${
                    selectedQuizOption === opt.id ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200 hover:border-rose-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="quiz7"
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
                    if (selectedQuizOption === 'b') {
                      setQuizState('correct')
                      setQuizError(null)
                      void setStageUnlocked('stage7', true)
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
                <Button onClick={() => navigate('/journey')} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6">
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
