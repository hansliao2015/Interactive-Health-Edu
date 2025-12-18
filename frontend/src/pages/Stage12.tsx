import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { getStageUnlocked, setStageUnlocked } from '../lib/journeyProgress'
import { resolveLockedRedirectPath } from '../lib/journeyGuard'
import { getStageState, setStageState } from '../lib/stageState'

type Treatment = {
  id: string
  title: string
  tagline: string
  icon: string
  detail: string
  steps: string[]
  caution: string
  gradient: string
  border: string
}

type Stage12State = {
  visitedTreatments: string[]
  activeTreatmentId: string
  hbValue: number
}

const treatments: Treatment[] = [
  {
    id: 'epo',
    title: '紅血球生成刺激劑（補血針）',
    tagline: '腎功能下降，EPO 補給讓骨髓重新開工',
    icon: '💉',
    detail:
      '腎臟製造的 EPO 減少時，紅血球生成變慢，臉色會蒼白。補充紅血球生成刺激劑能提醒骨髓「加速產線」，逐步提升血色素。',
    steps: ['依醫囑定期注射，按時回診追蹤血色素與血壓。', '搭配抽血監測，調整劑量避免過度升高造成血栓風險。'],
    caution: '補血針需醫師評估後開立，切勿自行購買或加量。',
    gradient: 'from-rose-50 via-white to-amber-50',
    border: 'border-rose-200',
  },
  {
    id: 'iron',
    title: '鐵劑補充',
    tagline: '鐵是造血的「原料」，缺鐵就缺血',
    icon: '🩸',
    detail:
      '鐵是紅血球重要成分，腎臟病患者容易缺鐵，會讓補血針的效果打折。適量補鐵能提升造血效率，但過量可能帶來副作用。',
    steps: ['依醫囑口服或靜脈補鐵，定期追蹤鐵蛋白與轉鐵蛋白飽和度。', '補鐵期間留意胃部不適或便祕，若不舒服告知醫師。'],
    caution: '不要自行購買高鐵保健品，以免過量或與其他藥物交互作用。',
    gradient: 'from-amber-50 via-white to-lime-50',
    border: 'border-amber-200',
  },
  {
    id: 'transfusion',
    title: '輸血',
    tagline: '嚴重貧血時的加速方案，需要評估風險',
    icon: '❤️',
    detail:
      '當血色素過低、症狀明顯或需要緊急提升血色素時，醫師可能評估輸血。輸血可以迅速改善，但需留意免疫與感染風險。',
    steps: ['輸血前後監測生命徵象，告知任何不適（發燒、搔癢、胸悶）。', '輸血後持續追蹤血色素與體重變化，避免體液負荷過多。'],
    caution: '輸血由醫療團隊評估並執行，需了解相關風險與替代方案。',
    gradient: 'from-sky-50 via-white to-indigo-50',
    border: 'border-indigo-200',
  },
]

const anemiaSignals = ['臉色蒼白', '容易喘', '心悸', '頭暈', '疲倦想睡', '運動耐力下降', '皮膚乾燥、冰冷']

const quizAnswers = ['a', 'c', 'e']

export function Stage12() {
  const navigate = useNavigate()
  const stageId = 'stage12'
  const prevPath = '/journey/stage11'
  const nextPath = '/journey/stage13'

  const saved = getStageState<Stage12State>(stageId)

  const [visitedTreatments, setVisitedTreatments] = useState<string[]>(() => saved?.visitedTreatments ?? [])
  const [activeTreatmentId, setActiveTreatmentId] = useState<string>(() => saved?.activeTreatmentId ?? treatments[0].id)
  const [hbValue, setHbValue] = useState<number>(() => saved?.hbValue ?? 9.5)

  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [quizState, setQuizState] = useState<'idle' | 'wrong' | 'correct'>('idle')
  const [quizError, setQuizError] = useState<string | null>(null)
  const [gateNotice, setGateNotice] = useState<string | null>(null)

  const visitedAll = visitedTreatments.length === treatments.length
  const progressPercent = Math.round((visitedTreatments.length / treatments.length) * 100)
  const activeTreatment = useMemo(() => treatments.find((t) => t.id === activeTreatmentId) ?? treatments[0], [activeTreatmentId])

  const hbStatus =
    hbValue < 10
      ? { label: '血色素偏低，易喘、心悸', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' }
      : hbValue <= 11.5
        ? { label: '目標範圍，持續追蹤與補給', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' }
        : { label: '過高需醫師評估，避免血栓風險', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' }

  useEffect(() => {
    resolveLockedRedirectPath(stageId).then((path) => {
      if (path) navigate(path, { replace: true })
    })
  }, [navigate])

  useEffect(() => {
    getStageUnlocked(stageId).then(setIsUnlocked)
  }, [])

  useEffect(() => {
    setStageState<Stage12State>(stageId, { visitedTreatments, activeTreatmentId, hbValue })
  }, [visitedTreatments, activeTreatmentId, hbValue])

  const handleTreatmentSelect = (id: string) => {
    setActiveTreatmentId(id)
    setVisitedTreatments((prev) => (prev.includes(id) ? prev : [...prev, id]))
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
    setSelectedOptions([])
    setIsQuizOpen(true)
  }

  const toggleQuizOption = (id: string) => {
    setSelectedOptions((prev) => (prev.includes(id) ? prev.filter((opt) => opt !== id) : [...prev, id]))
    setQuizError(null)
    setQuizState('idle')
  }

  const submitQuiz = async () => {
    if (selectedOptions.length === 0) {
      setQuizError('請先選擇答案')
      return
    }
    const isCorrect = selectedOptions.length === quizAnswers.length && quizAnswers.every((ans) => selectedOptions.includes(ans))
    if (!isCorrect) {
      setQuizState('wrong')
      setQuizError('答案不正確，再試一次。提示：想想補血三招與就醫時的注意事項。')
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
          <p className="text-sm uppercase tracking-[0.4em] text-rose-500">Stage 12 / 為什麼看起來臉蒼白？</p>
          <h1 className="text-3xl font-black text-rose-800">腎友貧血 SOS：補血三招 + 自我監測</h1>
          <p className="text-slate-600">
            腎功能下降會減少紅血球生成素，導致貧血。透過補血針、補鐵與必要時的輸血，加上定期監測血色素，讓臉色回暖、精神回來。
          </p>
          {gateNotice && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{gateNotice}</div>}
        </header>

        <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <div className="bg-white/85 rounded-3xl shadow-lg p-8 border border-rose-100 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-rose-500">血色素儀表</p>
                <h2 className="text-xl font-black text-slate-900">拖動滑桿，查看血色狀態</h2>
                <p className="text-sm text-slate-600">目標範圍通常落在 10–11.5 g/dL，過低會喘，過高也要醫師評估。</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.25em] text-rose-500">收集進度</p>
                <p className="text-3xl font-black text-rose-700">{progressPercent}%</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_0.9fr] gap-6">
              <div className="space-y-4">
                <div className="rounded-3xl border border-rose-100 bg-rose-50/70 p-5 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800">血色素 (g/dL)</p>
                    <span className="text-3xl font-black text-rose-700">{hbValue.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={14}
                    step={0.1}
                    value={hbValue}
                    onChange={(e) => setHbValue(Number(e.target.value))}
                    className="w-full accent-rose-500"
                  />
                  <div className={`rounded-2xl border px-4 py-2 text-sm ${hbStatus.bg} ${hbStatus.border} ${hbStatus.color}`}>{hbStatus.label}</div>
                </div>

                <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">貧血警訊</p>
                  <div className="flex flex-wrap gap-2">
                    {anemiaSignals.map((signal) => (
                      <span
                        key={signal}
                        className="px-3 py-1 rounded-full bg-white border border-emerald-100 text-xs font-semibold text-emerald-800 shadow-sm"
                      >
                        {signal}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-emerald-700">出現多項症狀時，請告知醫護並檢查血色素。</p>
                </div>
              </div>

              <div className="relative rounded-3xl border border-rose-100 bg-white shadow-inner overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,#fb7185,transparent_35%),radial-gradient(circle_at_70%_60%,#fbbf24,transparent_40%)]" />
                <div className="relative p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center text-2xl">🫘</div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-rose-500">腎臟小劇場</p>
                      <h3 className="text-xl font-black text-slate-900">為什麼臉色蒼白？</h3>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    腎臟負責製造紅血球生成素，當腎功能下降，EPO 減少、造血材料不足，就像工廠缺料缺令單，血色素自然下滑。補血針、補鐵與必要時的輸血，就是重新補齊工廠的「令牌、原料、快遞」。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border bg-white/90 shadow-lg p-6 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center text-2xl">{activeTreatment.icon}</div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-rose-500">{visitedTreatments.includes(activeTreatment.id) ? '已閱讀' : '待探索'}</p>
                    <h3 className="text-2xl font-bold text-slate-900">{activeTreatment.title}</h3>
                    <p className="text-sm text-slate-600">{activeTreatment.tagline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {treatments.map((treatment, idx) => {
                    const isActive = activeTreatmentId === treatment.id
                    const isVisited = visitedTreatments.includes(treatment.id)
                    return (
                      <button
                        key={treatment.id}
                        type="button"
                        onClick={() => handleTreatmentSelect(treatment.id)}
                        className={`w-9 h-9 rounded-full border text-xs font-bold flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-rose-500 text-white border-rose-500 shadow-md scale-105'
                            : isVisited
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-rose-200'
                        }`}
                        aria-label={treatment.title}
                        title={treatment.title}
                      >
                        {idx + 1}
                        {isVisited && !isActive && <span className="sr-only">（已瀏覽）</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className={`rounded-2xl border ${activeTreatment.border} bg-white/80 px-4 py-3 text-sm text-slate-800`}>{activeTreatment.detail}</div>

              <div className="space-y-3">
                {activeTreatment.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <span className="h-8 w-8 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center">{idx + 1}</span>
                    <p className="text-slate-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{activeTreatment.caution}</div>
            </div>

            <div className="rounded-3xl border border-rose-100 bg-white shadow-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-lg">📒</div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">已瀏覽方案</p>
                  <h3 className="text-lg font-bold text-slate-900">目前掌握</h3>
                </div>
              </div>
              {visitedTreatments.length === 0 ? (
                <p className="text-sm text-slate-600">尚未瀏覽任何方案，點擊上方卡片開始探索。</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {treatments
                    .filter((t) => visitedTreatments.includes(t.id))
                    .map((t) => (
                      <span
                        key={t.id}
                        className="px-3 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 shadow-sm flex items-center gap-2"
                      >
                        <span className="text-base">{t.icon}</span>
                        <span className="font-semibold">{t.title}</span>
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {isQuizOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-500">Stage 12 問題</p>
            <h3 className="text-xl font-semibold text-slate-900">貧血矯正，哪些作法正確？（可複選）</h3>
            <p className="text-sm text-slate-600 leading-relaxed">勾選所有對腎友貧血有幫助的行動。</p>
            <div className="grid gap-2">
              {[
                { id: 'a', label: '腎功能下降導致 EPO 減少時，需由醫師開立補血針' },
                { id: 'b', label: '補鐵可以自己買保健品，越多越好' },
                { id: 'c', label: '補血針常需搭配鐵劑，並定期抽血追蹤血色素與鐵指標' },
                { id: 'd', label: '體重飆升與水腫跟貧血無關，不必理會' },
                { id: 'e', label: '嚴重貧血時醫師可能評估輸血，但需了解風險與監測' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 rounded-2xl border p-3 cursor-pointer transition-colors ${
                    selectedOptions.includes(opt.id)
                      ? 'border-rose-400 bg-rose-50 text-rose-700'
                      : 'border-slate-200 hover:border-emerald-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    name="stage12-quiz"
                    value={opt.id}
                    checked={selectedOptions.includes(opt.id)}
                    onChange={() => toggleQuizOption(opt.id)}
                  />
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs font-black ${
                      selectedOptions.includes(opt.id) ? 'border-rose-400 bg-rose-500 text-white' : 'border-slate-300 bg-white text-white'
                    }`}
                    aria-hidden="true"
                  >
                    ✓
                  </span>
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
