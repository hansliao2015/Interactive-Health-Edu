import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { getStage3State, getStageUnlocked, setStage3State, setStageUnlocked } from '../lib/journeyProgress'

type OptionItem = {
  id: string
  label: string
  detail?: string
  weight: number
  icon: string
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <div
      className={`w-5 h-5 rounded-md border flex items-center justify-center ${
        checked ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-300 text-transparent'
      }`}
      aria-hidden="true"
    >
      ✓
    </div>
  )
}

const riskFactors: OptionItem[] = [
  { id: 'diabetes', label: '糖尿病患者', weight: 1, icon: '🍬' },
  { id: 'hypertension', label: '高血壓患者', weight: 1, icon: '🩺' },
  { id: 'family', label: '腎臟病家族史', weight: 1, icon: '👨‍👩‍👧‍👦' },
  { id: 'age65', label: '高齡：65 以上', weight: 1, icon: '👴' },
  { id: 'gout', label: '痛風患者', weight: 1, icon: '🦶' },
  { id: 'smoke', label: '抽菸', weight: 1, icon: '🚬' },
  { id: 'nsaids', label: '長期使用止痛藥', weight: 1, icon: '💊' },
  {
    id: 'obesity',
    label: '肥胖',
    detail: '男生腰圍 ≥90cm / 女生 ≥80cm',
    weight: 1,
    icon: '📏',
  },
  { id: 'cvd', label: '心血管病史：心衰竭', weight: 1, icon: '❤️' },
  { id: 'proteinuria', label: '蛋白尿', weight: 1, icon: '🫧' },
]

const symptoms: OptionItem[] = [
  { id: 'foam', label: '泡泡尿', weight: 1, icon: '🫧' },
  { id: 'edema', label: '水腫', weight: 1, icon: '💧' },
  { id: 'highbp', label: '高血壓', weight: 1, icon: '📈' },
  { id: 'anemia', label: '貧血', weight: 1, icon: '🩸' },
  { id: 'fatigue', label: '疲倦', weight: 1, icon: '😴' },
]

type Severity = 'low' | 'moderate' | 'high' | 'extreme'

const severityConfig: Record<
  Severity,
  { label: string; bar: string; glow: string; meter: string }
> = {
  low: {
    label: '低度',
    bar: 'from-emerald-400 to-emerald-500',
    glow: 'ring-emerald-300/40',
    meter: 'bg-emerald-100 text-emerald-700',
  },
  moderate: {
    label: '中度',
    bar: 'from-amber-400 to-amber-500',
    glow: 'ring-amber-300/40',
    meter: 'bg-amber-100 text-amber-800',
  },
  high: {
    label: '高度',
    bar: 'from-orange-400 to-orange-500',
    glow: 'ring-orange-300/40',
    meter: 'bg-orange-100 text-orange-800',
  },
  extreme: {
    label: '極高',
    bar: 'from-rose-500 to-rose-600',
    glow: 'ring-rose-300/40',
    meter: 'bg-rose-100 text-rose-800',
  },
}

const getSeverity = (score: number, maxScore: number): Severity => {
  const ratio = maxScore <= 0 ? 0 : score / maxScore
  if (ratio >= 0.7) return 'extreme'
  if (ratio >= 0.5) return 'high'
  if (ratio >= 0.25) return 'moderate'
  return 'low'
}

export function Stage3() {
  const navigate = useNavigate()
  const saved = getStage3State()
  const [riskFactorIds, setRiskFactorIds] = useState<string[]>(() => saved?.riskFactorIds ?? [])
  const [symptomIds, setSymptomIds] = useState<string[]>(() => saved?.symptomIds ?? [])
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(() => getStageUnlocked('stage3'))
  const [quizState, setQuizState] = useState<'idle' | 'wrong' | 'correct'>('idle')

  const riskScore = useMemo(() => {
    const selected = new Set(riskFactorIds)
    return riskFactors.reduce((sum, item) => sum + (selected.has(item.id) ? item.weight : 0), 0)
  }, [riskFactorIds])

  const symptomScore = useMemo(() => {
    const selected = new Set(symptomIds)
    return symptoms.reduce((sum, item) => sum + (selected.has(item.id) ? item.weight : 0), 0)
  }, [symptomIds])

  const maxScore = useMemo(
    () => riskFactors.reduce((sum, item) => sum + item.weight, 0) + symptoms.reduce((sum, item) => sum + item.weight, 0),
    [],
  )

  const totalScore = riskScore + symptomScore
  const severity = getSeverity(totalScore, maxScore)
  const config = severityConfig[severity]
  const progress = Math.min(100, Math.round((maxScore <= 0 ? 0 : totalScore / maxScore) * 100))

  useEffect(() => {
    setStage3State({ riskFactorIds, symptomIds })
  }, [riskFactorIds, symptomIds])

  const toggleId = (current: string[], id: string, setter: (next: string[]) => void) => {
    const set = new Set(current)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    setter(Array.from(set))
  }

  const clearAll = () => {
    setRiskFactorIds([])
    setSymptomIds([])
  }

  const handleArrowClick = () => {
    if (!isUnlocked) {
      setQuizState('idle')
      setIsQuizOpen(true)
      return
    }
    navigate('/journey/stage4')
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-rose-50 via-orange-50 to-amber-50 py-16 px-4 text-slate-800 relative overflow-hidden">
      <Button
        variant="ghost"
        onClick={() => navigate('/journey/stage2')}
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
          <p className="text-sm uppercase tracking-[0.4em] text-rose-500">Stage 03 / 腎臟病有徵兆</p>
          <h1 className="text-3xl font-black text-rose-800">腎臟病有徵兆：風險計量表</h1>
          <p className="text-slate-600">
            勾選你符合的風險因子與症狀，右側計量表會即時升降，讓你看見「需要警覺的程度」。
          </p>
        </header>

        <section className="bg-white rounded-3xl shadow-lg p-8 border border-rose-100">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">你有幾項慢性腎臟病風險因子</h2>
                <Button
                  variant="ghost"
                  onClick={clearAll}
                  className="hover:bg-slate-100"
                >
                  清除勾選
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {riskFactors.map((item) => {
                  const checked = riskFactorIds.includes(item.id)
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleId(riskFactorIds, item.id, setRiskFactorIds)}
                      className={`group w-full rounded-2xl border px-4 py-4 text-left transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${
                        checked ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white hover:border-rose-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-semibold text-slate-900">{item.label}</p>
                            <CheckBox checked={checked} />
                          </div>
                          {item.detail && <p className="text-xs text-slate-500 mt-1">{item.detail}</p>}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 space-y-3">
                <p className="font-semibold text-slate-900">慢性腎臟病的異常症狀（有此症狀請打勾）</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {symptoms.map((item) => {
                    const checked = symptomIds.includes(item.id)
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleId(symptomIds, item.id, setSymptomIds)}
                        className={`w-full rounded-2xl border px-4 py-4 text-left transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${
                          checked ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white hover:border-rose-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{item.icon}</span>
                            <p className="font-semibold text-slate-900">{item.label}</p>
                          </div>
                          <CheckBox checked={checked} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-rose-100 bg-linear-to-br from-white to-rose-50 p-6 shadow-inner">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-rose-500">計量表</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900">嚴重程度</h3>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${config.meter}`}>
                    {config.label}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-[88px_1fr] items-center">
                  <div className={`relative h-64 w-16 rounded-[28px] bg-white border border-slate-100 shadow-inner overflow-hidden ring-8 ${config.glow}`}>
                    <div
                      className={`absolute bottom-0 left-0 right-0 bg-linear-to-t ${config.bar} transition-all duration-500`}
                      style={{ height: `${progress}%` }}
                    ></div>
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute left-1/2 top-6 -translate-x-1/2 w-10 h-0.5 bg-slate-200/70"></div>
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 w-10 h-0.5 bg-slate-200/70"></div>
                      <div className="absolute left-1/2 bottom-6 -translate-x-1/2 w-10 h-0.5 bg-slate-200/70"></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-slate-100 bg-white/80 p-4">
                      <p className="text-sm text-slate-600">目前分數</p>
                      <p className="text-3xl font-black text-slate-900">{totalScore}</p>
                      <p className="text-xs text-slate-500">
                        風險因子 {riskFactorIds.length} 項（{riskScore} 分）＋症狀 {symptomIds.length} 項（{symptomScore} 分）
                      </p>
                    </div>
                    <div className="text-xs text-slate-500 leading-relaxed">
                      這是衛教用的互動指標，不等同診斷。若你有疑慮或症狀持續，建議盡快就醫抽血與驗尿確認。
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {isQuizOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-500">Stage 3</p>
            <h3 className="text-xl font-semibold text-slate-900">解鎖下一關</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              題目：泡泡尿最可能代表哪一項檢查異常？
            </p>

            <div className="grid gap-2">
              {[
                { id: 'a', label: '尿蛋白（蛋白尿）' },
                { id: 'b', label: '血色素（Hb）偏低' },
                { id: 'c', label: '血鈣偏低' },
                { id: 'd', label: '膽固醇（Chol）過高' },
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
                    setStageUnlocked('stage3', true)
                    setIsUnlocked(true)
                  }}
                  className="w-full text-left rounded-2xl border border-slate-200 bg-white px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-rose-200 cursor-pointer"
                >
                  <span className="font-semibold text-slate-900">{opt.label}</span>
                </button>
              ))}
            </div>

            {quizState === 'wrong' && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                答錯，請再試一次。
              </div>
            )}

            {quizState === 'correct' && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                解鎖成功！再點一次右側箭頭即可進入下一關。
              </div>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <Button variant="ghost" onClick={() => setIsQuizOpen(false)}>
                關閉
              </Button>
              {quizState === 'correct' && (
                <Button
                  onClick={() => navigate('/journey/stage4')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6"
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
