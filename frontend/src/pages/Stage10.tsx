import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { getStageUnlocked, setStageUnlocked } from '../lib/journeyProgress'
import { resolveLockedRedirectPath } from '../lib/journeyGuard'
import { getStageState, setStageState } from '../lib/stageState'

type FactorCard = {
  id: string
  title: string
  tagline: string
  icon: string
  gradient: string
  border: string
  steps: string[]
  reminders: string[]
}

type Stage10State = {
  checkedFactors: string[]
  activeFactorId: string
}

const factors: FactorCard[] = [
  {
    id: 'acute',
    title: '突發疾病',
    tagline: '感染、發燒、脫水會讓腎臟瞬間缺血，處置越慢傷害越大。',
    icon: '⚡',
    gradient: 'from-amber-50 via-white to-orange-50',
    border: 'border-amber-200',
    steps: [
      '連續嘔吐、腹瀉或發燒時，補充水分並盡快就醫，主動說明腎功能狀況。',
      '急診或住院時，提醒醫護評估腎毒性藥物或顯影劑的使用與劑量。',
      '觀察尿量、血壓變化，若明顯下降或偏低要立即反映。',
    ],
    reminders: ['尿量驟減與暈眩都是警訊，別自己撐。', '就醫時一句「我有腎功能問題」能換來更安全的處置。'],
  },
  {
    id: 'chronic',
    title: '慢性病控制不良',
    tagline: '血壓、血糖長期偏高會默默傷腎，沒有症狀不代表安全。',
    icon: '📈',
    gradient: 'from-rose-50 via-white to-amber-50',
    border: 'border-rose-200',
    steps: [
      '每日量血壓，紀錄血糖，按時服藥不要自行停藥或亂加減。',
      '與醫師確認達標數字：血壓 < 130/80，糖化血色素依個人目標調整。',
      '飲食少鹽少糖，規律運動與睡眠，避免體重快速波動。',
    ],
    reminders: ['慢性病穩定 = 腎臟減壓。', '忘記量測就設鬧鐘或用 APP 提醒。'],
  },
  {
    id: 'medical',
    title: '醫源性',
    tagline: '顯影劑、抗生素或 NSAIDs 止痛藥都可能增加腎負擔。',
    icon: '💉',
    gradient: 'from-indigo-50 via-white to-cyan-50',
    border: 'border-indigo-200',
    steps: [
      '檢查需打顯影劑時，事前告知腎功能並詢問是否可用低劑量或替代方案。',
      '避免自行購買 NSAIDs 止痛藥，疼痛時請醫師開立較安全的處方。',
      '定期檢視藥袋，留意重複處方或保健品，任何疑問先問醫師或藥師。',
    ],
    reminders: ['不熟悉的藥都先問清楚，尤其是長期吃的。', '顯影劑前後注意水分與腎功能追蹤。'],
  },
  {
    id: 'habit',
    title: '生活習慣',
    tagline: '重鹽重甜、熬夜、抽菸會讓腎臟長期處於高壓狀態。',
    icon: '🍟',
    gradient: 'from-lime-50 via-white to-emerald-50',
    border: 'border-emerald-200',
    steps: [
      '料理少鹽少醬，外食選湯分開、少醬汁的菜色，手搖飲改無糖微冰。',
      '每週 150 分鐘中強度運動，加上 7–9 小時睡眠幫腎臟降壓。',
      '戒菸、減少含糖飲料與重口味，固定紀錄體重與腰圍變化。',
    ],
    reminders: ['今天少一匙醬油，就是給腎臟的禮物。', '睡眠、運動、飲食三合一才是穩定方程式。'],
  },
  {
    id: 'time',
    title: '時間因素',
    tagline: '腎功能惡化常是「默默累積」，拖延追蹤就錯過介入時機。',
    icon: '⏳',
    gradient: 'from-slate-50 via-white to-slate-100',
    border: 'border-slate-200',
    steps: [
      '固定每 3–6 個月回診檢查 eGFR、尿蛋白，關注趨勢而非單次數字。',
      '設定提醒或與家人共用行事曆，讓抽血與回診不再忘記。',
      '指數下滑時，及早討論飲食與藥物調整，必要時轉介腎臟科。',
    ],
    reminders: ['追蹤是早期修正的唯一方法。', '比起「再等等」，「早一點」總是更安全。'],
  },
]

export function Stage10() {
  const navigate = useNavigate()
  const stageId = 'stage10'
  const prevPath = '/journey/stage9'
  const nextPath = '/journey/stage11'

  const saved = getStageState<Stage10State>(stageId)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [quizState, setQuizState] = useState<'idle' | 'wrong' | 'correct'>('idle')
  const [quizError, setQuizError] = useState<string | null>(null)
  const [gateNotice, setGateNotice] = useState<string | null>(null)
  const [checkedFactors, setCheckedFactors] = useState<string[]>(() => saved?.checkedFactors ?? [])
  const [activeFactorId, setActiveFactorId] = useState<string>(() => saved?.activeFactorId ?? factors[0].id)

  const progressPercent = Math.round((checkedFactors.length / factors.length) * 100)
  const activeFactor = factors.find((factor) => factor.id === activeFactorId) ?? factors[0]

  useEffect(() => {
    resolveLockedRedirectPath(stageId).then((path) => {
      if (path) navigate(path, { replace: true })
    })
  }, [navigate])

  useEffect(() => {
    getStageUnlocked(stageId).then(setIsUnlocked)
  }, [])

  useEffect(() => {
    setStageState<Stage10State>(stageId, { checkedFactors, activeFactorId })
  }, [checkedFactors, activeFactorId])

  const handleFactorSelect = (id: string) => {
    setActiveFactorId(id)
    setCheckedFactors((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setGateNotice(null)
  }

  const handleArrowClick = () => {
    if (isUnlocked) {
      navigate(nextPath)
      return
    }
    setGateNotice(null)
    setQuizState('idle')
    setQuizError(null)
    setSelectedOption(null)
    setIsQuizOpen(true)
  }

  const submitQuiz = async () => {
    if (!selectedOption) {
      setQuizError('請先選擇答案')
      return
    }
    if (selectedOption !== 'a') {
      setQuizState('wrong')
      setQuizError('答案不正確，再試一次。')
      return
    }
    await setStageUnlocked(stageId, true)
    setIsUnlocked(true)
    setQuizState('correct')
    setQuizError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 py-16 px-4 text-slate-800 relative overflow-hidden">
      <Button
        variant="ghost"
        onClick={() => navigate(prevPath)}
        className="fixed top-20 left-4 z-30 bg-white/70 backdrop-blur border border-white hover:bg-white shadow-sm cursor-pointer"
      >
        ← 回到上一關
      </Button>

      <button
        aria-label={isUnlocked ? '前往下一關' : '解鎖下一關'}
        onClick={handleArrowClick}
        className={`fixed top-1/2 right-4 -translate-y-1/2 z-30 flex flex-col items-center gap-2 rounded-3xl px-4 py-5 shadow-xl transition-all duration-200 cursor-pointer ${
          isUnlocked ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-600'
        }`}
      >
        <span className="text-2xl">{isUnlocked ? '🔓' : '🔒'}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M13.172 12 8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
        </svg>
      </button>

      <div className="max-w-6xl mx-auto space-y-10">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.4em] text-rose-500">Stage 10 / 命運分岔路</p>
          <h1 className="text-3xl font-black text-rose-800">腎臟好壞，一念之間</h1>
          <p className="text-slate-600">
            影響腎功能的五大路口：突發疾病、慢性病控制不良、醫源性、生活習慣、時間因素。
          </p>
          {gateNotice && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{gateNotice}</div>}
        </header>

        <section className="bg-white/80 rounded-3xl shadow-lg p-8 border border-rose-100 space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">五大分岔路</p>
                <h2 className="text-xl font-black text-slate-900">點一張卡，看一個守護重點</h2>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.25em] text-rose-500">探索進度</p>
                <p className="text-3xl font-black text-rose-700">{progressPercent}%</p>
              </div>
            </div>
            <div className="h-3 rounded-full bg-rose-100 overflow-hidden">
              <div className="h-full bg-rose-400 transition-all duration-500" style={{ width: `${progressPercent}%` }} aria-label={`已完成 ${progressPercent}%`}></div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8">
            <div className="grid sm:grid-cols-2 gap-4">
              {factors.map((factor) => {
                const isActive = activeFactorId === factor.id
                const isDone = checkedFactors.includes(factor.id)
                return (
                  <button
                    key={factor.id}
                    onClick={() => handleFactorSelect(factor.id)}
                    className={`text-left rounded-3xl border p-5 shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-1 ${
                      isActive ? 'ring-2 ring-rose-300 shadow-md' : ''
                    } ${factor.border} bg-gradient-to-br ${factor.gradient}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{factor.icon}</span>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{factor.title}</h3>
                        </div>
                      </div>
                      {isDone && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          已閱讀
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-slate-700 leading-relaxed">{factor.tagline}</p>
                  </button>
                )
              })}
            </div>

            <div className={`rounded-3xl border bg-white/90 shadow-sm p-6 space-y-5 ${activeFactor.border}`}>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center text-2xl">{activeFactor.icon}</div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{activeFactor.title}</h3>
                  <p className="text-sm text-slate-600">{activeFactor.tagline}</p>
                </div>
              </div>

              <div className="space-y-3">
                {activeFactor.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <span className="h-8 w-8 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center">{idx + 1}</span>
                    <p className="text-slate-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {activeFactor.reminders.map((reminder, idx) => (
                  <div key={idx} className="rounded-2xl border border-rose-100 bg-rose-50/60 px-4 py-3 text-sm text-rose-800">
                    {reminder}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-1">
          <div className="bg-white/90 rounded-3xl shadow-lg border border-rose-100 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-lg">🛡️</div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">惡化五因子</p>
                <h3 className="text-xl font-bold text-slate-900">一眼看懂健康守則</h3>
              </div>
            </div>
            <div className="grid md:grid-cols-5 gap-3">
              {[
                { label: '突發疾病', desc: '發燒脫水要快就醫' },
                { label: '慢性病控制不良', desc: '血壓血糖穩才減壓' },
                { label: '醫源性', desc: '顯影劑與用藥先告知' },
                { label: '生活習慣', desc: '少鹽少糖多睡眠' },
                { label: '時間因素', desc: '規律追蹤早介入' },
              ].map((item, idx) => (
                <div key={item.label} className="rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-center">
                  <p className="text-sm font-bold text-emerald-800">{idx + 1}. {item.label}</p>
                  <p className="text-xs text-slate-600 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {isQuizOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-500">Stage 10 問題</p>
            <h3 className="text-xl font-semibold text-slate-900">解鎖下一關</h3>
            <p className="text-sm text-slate-600 leading-relaxed">哪一個做法能降低腎功能惡化風險？</p>
            <div className="grid gap-2">
              {[
                { id: 'a', label: '發燒、嘔吐時及早就醫並告知腎功能狀況' },
                { id: 'b', label: '顯影劑檢查不用報告腎功能，做完再說' },
                { id: 'c', label: '血壓血糖穩不穩定不重要，沒症狀就好' },
                { id: 'd', label: '常熬夜、吃重鹽重甜，腎臟也能撐住' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 rounded-2xl border p-3 cursor-pointer transition-colors ${
                    selectedOption === opt.id ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200 hover:border-emerald-200'
                  }`}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    name="stage10-quiz"
                    value={opt.id}
                    checked={selectedOption === opt.id}
                    onChange={(e) => {
                      setSelectedOption(e.target.value)
                      setQuizError(null)
                      setQuizState('idle')
                    }}
                  />
                  <span className="font-semibold text-slate-900">{opt.label}</span>
                </label>
              ))}
            </div>
            {quizError && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{quizError}</div>}
            {quizState === 'correct' && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                解鎖成功！你可以按「進入下一關」繼續闖關。
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setIsQuizOpen(false)}>
                關閉
              </Button>
              {quizState !== 'correct' && (
                <Button onClick={submitQuiz} className="bg-rose-500 hover:bg-rose-600 text-white px-6 cursor-pointer">
                  確認答案
                </Button>
              )}
              {quizState === 'correct' && (
                <Button onClick={() => navigate(nextPath)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 cursor-pointer">
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
