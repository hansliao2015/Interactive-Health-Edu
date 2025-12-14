import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { getStage4State, getStageUnlocked, setStage4State, setStageUnlocked, type Stage4Scenario } from '../lib/journeyProgress'
import { resolveLockedRedirectPath } from '../lib/journeyGuard'

type TargetInfo =
  | { kind: 'range'; minMl: number; maxMl: number }
  | { kind: 'max'; maxMl: number }

function GlassMeter({ totalMl, target, showResult }: { totalMl: number; target: TargetInfo | null; showResult: boolean }) {
  const maxRef = showResult && target ? target.maxMl : 0
  const rawPercent = maxRef > 0 ? (totalMl / maxRef) * 100 : 0
  const clamped = Math.max(0, Math.min(140, rawPercent))
  const fill = showResult ? Math.max(0, Math.min(100, clamped)) : 0
  const over = showResult ? Math.max(0, clamped - 100) : 0

  const band =
    showResult && target && target.kind === 'range'
      ? {
          start: Math.max(0, Math.min(100, (target.minMl / target.maxMl) * 100)),
          height: Math.max(6, Math.min(100, ((target.maxMl - target.minMl) / target.maxMl) * 100)),
        }
      : null

  return (
    <div className="relative w-[180px] h-[300px] mx-auto">
      {/* Glass Body */}
      <div
        className="absolute left-1/2 top-6 -translate-x-1/2 w-[140px] h-[240px] 
                   border-2 border-slate-300/50 bg-slate-100/40
                   rounded-t-[40px] rounded-b-2xl
                   shadow-inner shadow-slate-400/30 overflow-hidden"
      >
        {/* Recommended range band */}
        {band && (
          <div
            className="absolute left-0 right-0 bg-emerald-300/30 backdrop-blur-[1px] border-y border-emerald-500/50"
            style={{ bottom: `${band.start}%`, height: `${band.height}%` }}
          />
        )}

        {/* Water Fill */}
        <div
          className="absolute left-0 right-0 bottom-0 transition-all duration-1000 ease-out"
          style={{ height: `${fill}%` }}
        >
          <div
            className="w-full h-full bg-gradient-to-t from-sky-500 to-sky-300 relative
                       after:absolute after:left-0 after:right-0 after:-top-1.5 after:h-3
                       after:bg-sky-200/80 after:rounded-full after:blur-[1px]"
          >
            {/* Water surface animation */}
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20100%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M0%2C50%20C200%2C0%20350%2C100%20500%2C50%20S650%2C0%20800%2C50%20L800%2C100%20L0%2C100%20Z%22%2F%3E%3C%2Fsvg%3E')] bg-repeat-x animate-[wave_3s_ease-in-out_infinite]" />
          </div>
        </div>

        {/* Overfill Indicator */}
        {over > 0 && (
          <div className="absolute left-0 right-0 top-0 h-2 bg-rose-500/80 animate-pulse" />
        )}

        {/* Glass Highlight */}
        <div className="absolute -left-4 top-0 w-2.5 h-full bg-white/50 rounded-full blur-[3px] -rotate-12" />
        
        {/* Percentage Display */}
        {showResult && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full px-4 py-2 bg-white/80 backdrop-blur-sm text-lg font-bold text-slate-800 shadow-md">
              {target ? `${Math.round(clamped)}%` : ''}
            </div>
          </div>
        )}
      </div>

      {/* Glass Base */}
      <div
        className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[150px] h-4
                   bg-slate-200/50 rounded-[50%]
                   shadow-[0_8px_12px_-4px_rgba(0,0,0,0.2)]"
      />
    </div>
  )
}

function NumberField({
  label,
  value,
  placeholder,
  min,
  max,
  onChange,
}: {
  label: string
  value: number | null
  placeholder?: string
  min?: number
  max?: number
  onChange: (next: number | null) => void
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <input
        inputMode="numeric"
        type="number"
        value={value ?? ''}
        min={min}
        max={max}
        placeholder={placeholder}
        onChange={(e) => {
          const raw = e.target.value
          if (!raw) {
            onChange(null)
            return
          }
          const parsed = Number(raw)
          onChange(Number.isFinite(parsed) ? parsed : null)
        }}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition-all focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
      />
    </label>
  )
}

export function Stage4() {
  const navigate = useNavigate()

  useEffect(() => {
    resolveLockedRedirectPath('stage4').then((path) => {
      if (path) navigate(path, { replace: true })
    })
  }, [navigate])

  const [scenario, setScenario] = useState<Stage4Scenario>('normal')
  const [weightKg, setWeightKg] = useState<number | null>(50)
  const [yesterdayUrineMl, setYesterdayUrineMl] = useState<number | null>(null)
  const [plannedIntake, setPlannedIntake] = useState<number | null>(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const [savedState, unlocked] = await Promise.all([
        getStage4State(),
        getStageUnlocked('stage4')
      ]);

      if (savedState) {
        setScenario(savedState.scenario)
        setWeightKg(savedState.weightKg ?? 50)
        setYesterdayUrineMl(savedState.yesterdayUrineMl ?? null)
        setPlannedIntake(savedState.plannedIntake ?? null)
      }
      
      setIsUnlocked(unlocked)
      setLoading(false)
    }

    loadData()
  }, [])
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [quizState, setQuizState] = useState<'idle' | 'wrong' | 'correct'>('idle')
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null)
  const [quizError, setQuizError] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [resultTarget, setResultTarget] = useState<TargetInfo | null>(null)
  const [resultIntake, setResultIntake] = useState<number | null>(null)

  const target = useMemo(() => {
    if (scenario === 'restricted') {
      if (typeof yesterdayUrineMl !== 'number' || !Number.isFinite(yesterdayUrineMl)) return null
      return { kind: 'max' as const, maxMl: Math.max(0, Math.round(yesterdayUrineMl + 500)) }
    }

    if (typeof weightKg !== 'number' || !Number.isFinite(weightKg)) return null
    const minMl = Math.max(0, Math.round(weightKg * 30))
    const maxMl = Math.max(0, Math.round(weightKg * 40))
    return { kind: 'range' as const, minMl, maxMl }
  }, [scenario, weightKg, yesterdayUrineMl])

  const handleResult = async () => {
    setFormError(null)
    if (scenario === 'normal' && (!weightKg || !plannedIntake)) {
      setFormError('請輸入體重與今日預估飲水量')
      setShowResult(false)
      return
    }
    if (scenario === 'restricted' && ((yesterdayUrineMl === null || yesterdayUrineMl === undefined) || !plannedIntake)) {
      setFormError('請輸入前一天尿量與今日預估飲水量')
      setShowResult(false)
      return
    }

    await setStage4State({
      scenario,
      weightKg,
      yesterdayUrineMl,
      entriesMl: {}, // This seems to be unused in the logic, keeping it as is.
      plannedIntake,
    })

    setResultTarget(target)
    setResultIntake(plannedIntake ?? null)
    setShowResult(true)
  }

  const analysis = useMemo(() => {
    if (!showResult || !resultTarget || !resultIntake) return null
    const intake = resultIntake
    const max = resultTarget.maxMl
    const rate = max > 0 ? Math.round((intake / max) * 100) : 0
    const within =
      resultTarget.kind === 'range'
        ? intake >= resultTarget.minMl && intake <= resultTarget.maxMl
        : intake <= resultTarget.maxMl

    const detail =
      resultTarget.kind === 'range'
        ? within
          ? '你的預估量落在建議範圍內，維持即可。'
          : intake < resultTarget.minMl
            ? '偏少，可能導致脫水，請適度補充。'
            : '偏多，可能導致水腫，請減少。'
        : within
          ? '未超過上限，維持即可。'
          : '超過上限，請務必減少水分避免水腫。'

    return { rate, within, detail }
  }, [showResult, resultTarget, resultIntake])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <p className="text-xl text-slate-600">載入中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 py-16 px-4 text-slate-800 relative overflow-hidden">
      <Button
        variant="ghost"
        onClick={() => navigate('/journey/stage3')}
        className="fixed top-20 left-4 z-30 bg-white/70 backdrop-blur border border-white hover:bg-white shadow-sm"
      >
        ← 回到上一關
      </Button>

      <button
        aria-label={isUnlocked ? '前往下一關' : '解鎖下一關'}
        onClick={() => {
          if (!isUnlocked) {
            setQuizState('idle')
            setSelectedQuizOption(null)
            setQuizError(null)
            setIsQuizOpen(true)
            return
          }
          navigate('/journey/stage5')
        }}
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
          <p className="text-sm uppercase tracking-[0.4em] text-rose-500">Stage 04 / 你喝對水了嗎？</p>
          <h1 className="text-3xl font-black text-rose-800">水分管理</h1>
          <p className="text-slate-600">依情境算出今日建議，填完後按「查看結果」再顯示達標率與分析。</p>
        </header>

        <section className="bg-white rounded-3xl shadow-lg p-8 border border-rose-100 space-y-8">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">情境選擇</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setScenario('normal')
                      setShowResult(false)
                    }}
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
                      scenario === 'normal'
                        ? 'bg-rose-500 text-white shadow-sm hover:bg-rose-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    沒水腫
                  </button>
                  <button
                    onClick={() => {
                      setScenario('restricted')
                      setShowResult(false)
                    }}
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
                      scenario === 'restricted'
                        ? 'bg-rose-500 text-white shadow-sm hover:bg-rose-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    尿量少／水腫
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-rose-50 p-6 space-y-4 shadow-inner">
                {scenario === 'restricted' ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-rose-600 font-black text-lg">出現尿量減少、水腫</p>
                      <p className="text-rose-600 font-black text-xl">每日水分攝取量 = 前一天尿量 + 500ml</p>
                    </div>
                    <NumberField
                      label="前一天尿量（ml）"
                      value={yesterdayUrineMl}
                      placeholder="例如：800"
                      min={0}
                      max={5000}
                      onChange={(val) => {
                        setYesterdayUrineMl(val)
                        setShowResult(false)
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xl font-black text-slate-900">沒水腫：體重（每公斤）× 30～40 c.c.</p>
                    <NumberField
                      label="體重（公斤）"
                      value={weightKg}
                      min={20}
                      max={200}
                      onChange={(val) => {
                        setWeightKg(val)
                        setShowResult(false)
                      }}
                    />
                  </div>
                )}

                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-900">今日預估飲水量（ml）</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={plannedIntake ?? ''}
                    onChange={(e) => {
                      const parsed = Number(e.target.value)
                      setPlannedIntake(Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : null)
                      setShowResult(false)
                      setFormError(null)
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition-all focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                    placeholder="輸入今天想喝的水量"
                  />
                </label>

                <div className="flex items-center gap-3 pt-2">
                  <Button onClick={handleResult} className="bg-rose-500 hover:bg-rose-600 text-white px-6">
                    查看結果
                  </Button>
                  {formError && <p className="text-sm text-rose-600">{formError}</p>}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">水分控制提醒</p>
                <ul className="mt-3 text-sm text-slate-700 space-y-2 list-disc pl-5">
                  <li>發生水腫時要控制水分，減少肺積水、高血壓及充血性心衰竭等合併症。</li>
                  <li>避免太鹹的食物，否則容易口乾一直想喝水。</li>
                  <li>喝熱水更解渴，水中加幾滴檸檬汁也可；口含冰塊算在水分內，不要過量。</li>
                  <li>含水量高的食物（稀飯、豆腐、布丁、果凍、冰品等）也會增加總水分。</li>
                  <li>把今日水量放進固定容器再分次飲用，藥物盡量一起服，減少重複喝水。</li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-white to-rose-50 p-6 shadow-inner space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-rose-500">今日預估</p>
                    <p className="mt-1 text-3xl font-black text-slate-900">{showResult && plannedIntake ? plannedIntake : '—'} {showResult && plannedIntake ? 'ml' : ''}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      目標：
                      {showResult && target
                        ? target.kind === 'range'
                          ? `${target.minMl}～${target.maxMl} ml`
                          : `≤ ${target.maxMl} ml`
                        : '查看結果後顯示'}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                      analysis
                        ? analysis.within
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {analysis ? (analysis.within ? '✓ 已在範圍內' : '✕ 需要調整') : '— 未設定'}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-[180px_1fr] items-center">
                  <GlassMeter totalMl={showResult && resultIntake ? resultIntake : 0} target={showResult ? resultTarget : null} showResult={showResult} />
                  <div className="space-y-3">
                    {analysis && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                        <p className="text-sm font-semibold text-slate-900">達標率</p>
                        <p className="text-3xl font-black text-slate-900">{analysis.rate}%</p>
                        <p className="text-sm text-slate-700">{analysis.detail}</p>
                      </div>
                    )}
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
            <p className="text-sm uppercase tracking-[0.3em] text-rose-500">Stage 4 問題</p>
            <h3 className="text-xl font-semibold text-slate-900">解鎖下一關</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              題目：出現尿量減少或水腫時，限制水分的病人「每日水分攝取量」應怎麼計算？
            </p>

            <div className="grid gap-2">
              {[
                { id: 'a', label: '體重（每公斤）× 30～40 c.c.' },
                { id: 'b', label: '前一天尿量 + 500 ml' },
                { id: 'c', label: '每天固定喝 3000 ml' },
                { id: 'd', label: '總喝水量越多越好' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 rounded-2xl border p-3 cursor-pointer transition-colors ${
                    selectedQuizOption === opt.id ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200 hover:border-rose-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="quiz4"
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
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {quizError}
              </div>
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
                  onClick={async () => {
                    if (!selectedQuizOption) {
                      setQuizError('請先選擇答案')
                      return
                    }
                    const correct = selectedQuizOption === 'b'
                    if (!correct) {
                      setQuizState('wrong')
                      setQuizError('答案不正確，再試一次。')
                      return
                    }
                    setQuizState('correct')
                    setQuizError(null)
                    await setStageUnlocked('stage4', true)
                    setIsUnlocked(true)
                  }}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-6"
                >
                  確認答案
                </Button>
              )}
              {quizState === 'correct' && (
                <Button onClick={() => navigate('/journey/stage5')} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6">
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
