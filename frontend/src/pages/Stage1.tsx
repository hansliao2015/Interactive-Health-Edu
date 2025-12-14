import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { getStageUnlocked, setStageUnlocked } from '../lib/journeyProgress'

const kidneyFunctions = [
  {
    title: '調節水分',
    description: '一天可過濾 160-190 公升液體，留住需要的水分，形成 1-2 公升尿液排出。',
    icon: '💧',
    summary: '每天回收大部分水分，僅排出 1-2 公升尿液。',
  },
  {
    title: '排除代謝廢物',
    description: '把食物與藥物產生的代謝物透過腎小球與腎小管製作成尿液排出體外。',
    icon: '♻️',
    summary: '代謝廢物透過尿液排出，維持體內清潔。',
  },
  {
    title: '平衡酸鹼與電解質',
    description: '維持體內鈉、鉀、鈣、鎂與酸鹼度，確保肌肉神經順利運作。',
    icon: '⚖️',
    summary: '調節鈉鉀鈣鎂濃度，讓肌肉神經順暢。',
  },
  {
    title: '分泌荷爾蒙',
    description: '調節血壓、刺激紅血球生成，維持骨骼健康，是默默守護者。',
    icon: '✨',
    summary: '協助穩定血壓、製造紅血球與保護骨骼。',
  },
]

const quizData = {
  question: '以下哪些是腎臟每天必須執行的重要任務？（可複選）',
  options: [
    { label: '調節水分', value: 'water' },
    { label: '排除代謝廢物', value: 'waste' },
    { label: '平衡酸鹼與電解質', value: 'balance' },
    { label: '分泌荷爾蒙', value: 'hormone' },
    { label: '製造膽汁', value: 'bile' },
  ],
  answers: ['water', 'waste', 'balance', 'hormone'],
}

export function Stage1() {
  const navigate = useNavigate()
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [isUnlocked, setIsUnlocked] = useState(() => getStageUnlocked('stage1'))
  const [quizError, setQuizError] = useState<string | null>(null)
  const [functionIndex, setFunctionIndex] = useState(0)
  const [visitedFunctions, setVisitedFunctions] = useState<boolean[]>(() =>
    kidneyFunctions.map((_, idx) => idx === 0)
  )
  const [isHighlighting, setIsHighlighting] = useState(false)
  const currentFunction = kidneyFunctions[functionIndex]
  const discoveredCount = visitedFunctions.filter(Boolean).length
  const progressPercent = Math.round((discoveredCount / kidneyFunctions.length) * 100)

  useEffect(() => {
    setIsHighlighting(true)
    const timeout = setTimeout(() => setIsHighlighting(false), 400)
    return () => clearTimeout(timeout)
  }, [functionIndex])

  useEffect(() => {
    setStageUnlocked('stage1', isUnlocked)
  }, [isUnlocked])

  const handleArrowClick = () => {
    if (!isUnlocked) {
      setIsQuizOpen(true)
      return
    }
    navigate('/journey/stage2')
  }

  const handleSubmit = () => {
    if (!selectedAnswers.length) {
      setQuizError('請至少選擇一項')
      return
    }
    const isCorrect =
      selectedAnswers.length === quizData.answers.length &&
      quizData.answers.every((ans) => selectedAnswers.includes(ans))
    if (isCorrect) {
      setIsUnlocked(true)
      setIsQuizOpen(false)
      setQuizError(null)
      setSelectedAnswers([])
    } else {
      setQuizError('答案不完全正確，再試一次。')
    }
  }

  const handleFunctionSelect = (idx: number) => {
    setFunctionIndex(idx)
    setVisitedFunctions((prev) => {
      if (prev[idx]) return prev
      const next = [...prev]
      next[idx] = true
      return next
    })
  }

  const toggleAnswer = (value: string) => {
    setSelectedAnswers((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    )
    setQuizError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 py-16 px-4 text-slate-800 relative overflow-hidden">
      <Button
        variant="ghost"
        onClick={() => navigate('/journey')}
        className="fixed top-20 left-4 z-30 bg-white/70 backdrop-blur border border-white hover:bg-white shadow-sm"
      >
        ← 回到上一關
      </Button>
      <button
        aria-label={isUnlocked ? '前往下一關' : '解鎖下一關'}
        onClick={handleArrowClick}
        className={`fixed top-1/2 right-4 -translate-y-1/2 z-30 flex flex-col items-center gap-2 rounded-3xl px-4 py-5 shadow-xl transition-all duration-200 ${
          isUnlocked ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-200 text-slate-500'
        }`}
      >
        <span className="text-2xl">{isUnlocked ? '🔓' : '🔒'}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-7 h-7"
        >
          <path d="M13.172 12 8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
        </svg>
      </button>

      <div className="max-w-6xl mx-auto space-y-10">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.4em] text-rose-500">Stage 01 / 認識腎臟</p>
          <h1 className="text-3xl font-black text-rose-800">人體淨水器：腎臟四大功能</h1>
          <p className="text-slate-600">
            腎臟像隱藏在後腰的淨水工程隊，每天為我們處理體液、電解質與荷爾蒙。
          </p>
        </header>

        <section className="bg-white rounded-3xl shadow-lg p-8 border border-rose-100">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-white border border-rose-100 p-4 flex flex-col gap-3">
              <p className="font-semibold text-rose-700">位置與外型</p>
              <div className="rounded-2xl border border-rose-100 shadow-sm bg-white/80 p-2">
                <img
                  src="/images/img1.png"
                  alt="腎臟位置示意"
                  className="max-h-64 w-full object-contain mx-auto"
                />
              </div>
              <p className="text-sm text-rose-800 leading-relaxed">
                人體後腰部各有一顆腎臟，長得像蠶豆，長度約 10-12 公分。
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-white border border-orange-100 p-4 flex flex-col gap-3">
              <p className="font-semibold text-orange-700">組成</p>
              <div className="rounded-2xl border border-orange-100 shadow-sm bg-white/80 p-2">
                <img
                  src="/images/img2.png"
                  alt="腎臟組成示意"
                  className="max-h-64 w-full object-contain mx-auto"
                />
              </div>
              <p className="text-sm text-orange-800 leading-relaxed">
                每顆腎臟由約 100 萬個腎元組成，像 24 小時輪班的工程隊。
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-lg p-8 border border-rose-100 flex flex-col gap-6 md:grid md:grid-cols-[minmax(0,1.4fr)_320px] md:items-center md:gap-10">
          <div className="flex flex-col items-center justify-center md:justify-self-center text-center">
            <div className={`relative w-72 h-72 transition-transform duration-300 ${isHighlighting ? 'scale-105' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-b from-rose-200 to-rose-300 rounded-[40%] shadow-lg"></div>
              {isHighlighting && (
                <div className="absolute -inset-2 rounded-[45%] border border-rose-200/60 animate-ping opacity-70 pointer-events-none"></div>
              )}
              <div
                className={`absolute inset-4 bg-gradient-to-b from-rose-50 to-white rounded-[40%] border-[6px] border-rose-300 shadow-inner transition-shadow duration-300 ${
                  isHighlighting ? 'shadow-[0_0_25px_rgba(251,113,133,0.4)]' : ''
                }`}
              ></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 text-sm text-rose-700">
                <span className="text-4xl">{currentFunction.icon}</span>
                <p className="font-semibold mt-2">{currentFunction.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-rose-600">
                  {currentFunction.description}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {kidneyFunctions.map((func, idx) => (
                <button
                  key={func.title}
                  onClick={() => handleFunctionSelect(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    functionIndex === idx
                      ? 'bg-rose-500 scale-110'
                      : visitedFunctions[idx]
                        ? 'bg-rose-300'
                        : 'bg-rose-200 hover:bg-rose-300'
                  }`}
                  aria-label={func.title}
                ></button>
              ))}
            </div>
          </div>
          <div className="space-y-5 w-full md:max-w-xs md:justify-self-end">
            <div className="space-y-4">
              {kidneyFunctions.map((func, idx) => {
                const isActive = idx === functionIndex
                const isVisited = visitedFunctions[idx]
                return (
                  <button
                    key={func.title}
                    onClick={() => handleFunctionSelect(idx)}
                    className={`w-full text-left rounded-2xl border p-4 transition-all group ${
                      isActive
                        ? 'border-rose-400 bg-rose-50 shadow-md'
                        : isVisited
                          ? 'border-rose-200 bg-white hover:border-rose-300'
                          : 'border-slate-200 hover:border-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{func.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{func.title}</p>
                        <p className="text-sm text-slate-600">{func.summary}</p>
                      </div>
                      <span
                        className={`ml-2 text-xs font-semibold flex items-center gap-1 ${
                          isVisited ? 'text-emerald-500' : 'text-slate-300'
                        }`}
                      >
                        {isVisited ? '✔ 已探索' : '待探索'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-5 space-y-3 shadow-inner">
              <div className="flex items-center justify-between text-xs font-semibold tracking-[0.2em] text-rose-600 uppercase">
                <span>探索進度</span>
                <span>
                  {discoveredCount}/{kidneyFunctions.length}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/80 overflow-hidden">
                <div
                  className="h-full bg-rose-400 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                  aria-label={`已完成 ${progressPercent}%`}
                ></div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {kidneyFunctions.map((func, idx) => (
                  <span
                    key={`${func.title}-pill`}
                    className={`px-2.5 py-1 rounded-full border ${
                      visitedFunctions[idx]
                        ? 'bg-rose-500/10 border-rose-400 text-rose-700'
                        : 'border-slate-200 text-slate-400'
                    }`}
                  >
                    {func.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>

      {isQuizOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-500">Stage 1 問題</p>
            <h3 className="text-xl font-semibold text-slate-900">{quizData.question}</h3>
            <div className="space-y-3">
              {quizData.options.map((option) => {
                const isChecked = selectedAnswers.includes(option.value)
                return (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 rounded-2xl border p-3 cursor-pointer transition-colors ${
                      isChecked ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200 hover:border-rose-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-400"
                      checked={isChecked}
                      onChange={() => toggleAnswer(option.value)}
                    />
                    <span className="font-medium">{option.label}</span>
                  </label>
                )
              })}
            </div>
            {quizError && <p className="text-sm text-rose-500">{quizError}</p>}
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsQuizOpen(false)}>
                先等等
              </Button>
              <Button onClick={handleSubmit} className="bg-rose-500 hover:bg-rose-600 text-white px-6">
                確認答案
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
