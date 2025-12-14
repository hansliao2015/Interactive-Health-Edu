import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'

const kidneyFacts = [
  {
    label: '位置與外型',
    value: '人體後腰部各有一顆腎臟，長得像蠶豆，長度約 10-12 公分。',
  },
  {
    label: '組成',
    value: '每顆腎臟由約 100 萬個腎元組成，像 24 小時輪班的工程隊。',
  },
]

const kidneyFunctions = [
  {
    title: '調節水分',
    description: '一天可過濾 160-190 公升液體，留住需要的水分，形成 1-2 公升尿液排出。',
    icon: '💧',
  },
  {
    title: '排除代謝廢物',
    description: '把食物與藥物產生的代謝物透過腎小球與腎小管製作成尿液排出體外。',
    icon: '♻️',
  },
  {
    title: '平衡酸鹼與電解質',
    description: '維持體內鈉、鉀、鈣、鎂與酸鹼度，確保肌肉神經順利運作。',
    icon: '⚖️',
  },
  {
    title: '分泌荷爾蒙',
    description: '調節血壓、刺激紅血球生成，維持骨骼健康，是默默守護者。',
    icon: '✨',
  },
]

const quizData = {
  question: '你知道腎臟每天替你做幾件重要的事嗎？',
  options: [
    { label: '兩件', value: '2' },
    { label: '四件', value: '4' },
    { label: '六件', value: '6' },
  ],
  answer: '4',
}

export function Stage1() {
  const navigate = useNavigate()
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [quizError, setQuizError] = useState<string | null>(null)
  const [functionIndex, setFunctionIndex] = useState(0)
  const currentFunction = kidneyFunctions[functionIndex]

  const handleArrowClick = () => {
    if (!isUnlocked) {
      setIsQuizOpen(true)
      return
    }
    navigate('/journey/stage2')
  }

  const handleSubmit = () => {
    if (!selectedAnswer) {
      setQuizError('請先選擇一個答案')
      return
    }
    if (selectedAnswer === quizData.answer) {
      setIsUnlocked(true)
      setIsQuizOpen(false)
      setQuizError(null)
    } else {
      setQuizError('再想想！腎臟每天其實要同時守護四件事。')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 py-16 px-4 text-slate-800 relative overflow-hidden">
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
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-rose-500">Stage 01 / 認識腎臟</p>
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="bg-white/90 rounded-3xl shadow-lg p-6 border border-rose-100 flex-1">
              <h1 className="text-3xl font-black text-rose-800 mb-3">人體淨水器：腎臟四大功能</h1>
              <p className="text-slate-600">
                腎臟像隱藏在後腰的淨水工程隊，每天為我們處理體液、電解質與荷爾蒙。先透過本關掌握基本結構，
                下一關才能理解檢驗數值代表什麼。
              </p>
              <div className="mt-4 space-y-3">
                {kidneyFacts.map((fact) => (
                  <div key={fact.label} className="rounded-2xl bg-rose-50/70 p-4 text-sm text-rose-800 border border-rose-100">
                    <p className="font-semibold">{fact.label}</p>
                    <p>{fact.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 rounded-3xl bg-white/80 border border-rose-100 shadow-inner p-6">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <p className="text-sm font-semibold text-rose-500 uppercase tracking-[0.3em]">任務提示</p>
                  <h2 className="text-2xl font-bold text-slate-900 mt-2">完成磁鐵教具任務</h2>
                  <p className="text-sm text-slate-600 mt-2">
                    依序認識四大功能並貼到對應位置，最後透過小測驗檢查理解程度。
                  </p>
                </div>
                <div className="mt-6 rounded-2xl bg-gradient-to-r from-amber-100 to-orange-50 p-4 text-sm text-orange-900">
                  <p className="font-semibold">任務獎勵</p>
                  <p>解鎖 Stage 02：功能解讀所，學會読み eGFR 與肌酐值。</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="bg-white rounded-3xl shadow-lg p-8 border border-rose-100 flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-72 h-72 flex items-center justify-center">
              <div className="absolute inset-0 blur-3xl bg-rose-200/60 rounded-full"></div>
              <img
                src={kidneyDiagramSrc}
                alt="腎臟結構示意圖"
                className="relative w-full h-full object-contain drop-shadow-lg"
              />
              <div className="absolute bottom-4 inset-x-8 bg-white/90 rounded-2xl border border-rose-100 shadow p-3 text-center text-sm text-rose-700">
                <p className="font-semibold flex items-center justify-center gap-2">
                  <span>{currentFunction.icon}</span>
                  {currentFunction.title}
                </p>
                <p className="text-xs text-rose-600 mt-1 leading-relaxed">{currentFunction.description}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {kidneyFunctions.map((func, idx) => (
                <button
                  key={func.title}
                  onClick={() => setFunctionIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${functionIndex === idx ? 'bg-rose-500' : 'bg-rose-200 hover:bg-rose-300'}`}
                  aria-label={func.title}
                ></button>
              ))}
            </div>
          </div>
          <div className="flex-1 space-y-4">
            {kidneyFunctions.map((func, idx) => (
              <button
                key={func.title}
                onClick={() => setFunctionIndex(idx)}
                className={`w-full text-left rounded-2xl border p-4 transition-all ${
                  idx === functionIndex ? 'border-rose-400 bg-rose-50 shadow-sm' : 'border-slate-200 hover:border-rose-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{func.icon}</span>
                  <div>
                    <p className="font-semibold text-slate-900">{func.title}</p>
                    <p className="text-sm text-slate-600">{func.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-lg p-8 border border-rose-100 space-y-4">
          <div className="flex items-center gap-3 text-rose-700 text-sm">
            <span className="text-3xl">👷</span>
            <p>每個腎臟約由 100 萬個腎元組成，就像一支輪班不停的工程隊，維持淨化流程。</p>
          </div>
          <p className="text-slate-600 text-sm">
            牢記這句話：腎臟每天至少要同時顧好四件事。答對關卡題目就能解鎖前往下一站。
          </p>
        </section>

        <section className="bg-white/80 backdrop-blur rounded-3xl border border-white/70 shadow-inner p-6">
          <p className="text-sm font-semibold text-rose-500 uppercase tracking-[0.3em] mb-4">下一關預告</p>
          <div className="grid gap-4 md:grid-cols-3">
            {previewStages.map((stage) => (
              <div key={stage.title} className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800">{stage.title}</h3>
                <p className="text-sm text-slate-600 mt-2">{stage.tip}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button asChild variant="ghost" className="text-rose-500 hover:text-rose-700">
              <Link to="/journey">返回冒險地圖</Link>
            </Button>
          </div>
        </section>
      </div>

      {isQuizOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-500">Stage 1 問題</p>
            <h3 className="text-xl font-semibold text-slate-900">{quizData.question}</h3>
            <div className="space-y-3">
              {quizData.options.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 rounded-2xl border p-3 cursor-pointer transition-colors ${
                    selectedAnswer === option.value
                      ? 'border-rose-400 bg-rose-50 text-rose-700'
                      : 'border-slate-200 hover:border-rose-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="quiz"
                    value={option.value}
                    className="sr-only"
                    checked={selectedAnswer === option.value}
                    onChange={(e) => {
                      setSelectedAnswer(e.target.value)
                      setQuizError(null)
                    }}
                  />
                  <span className="font-medium">{option.label}</span>
                </label>
              ))}
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
