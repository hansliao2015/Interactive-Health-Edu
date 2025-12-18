import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { getStageUnlocked, setStageUnlocked } from '../lib/journeyProgress'
import { resolveLockedRedirectPath } from '../lib/journeyGuard'
import { getStageState, setStageState } from '../lib/stageState'

type Symptom = {
  id: string
  title: string
  tagline: string
  detail: string
  icon: string
  actions: string[]
}

type Stage11State = {
  visitedSymptoms: string[]
  activeSymptomId: string
}

const symptoms: Symptom[] = [
  {
    id: 'nausea',
    title: '噁心想吐',
    tagline: '代謝物堆積讓胃口變差',
    detail: '腎臟排毒變慢，尿毒素累積會讓味覺、食慾下降，甚至反胃想吐。',
    icon: '🤢',
    actions: ['若持續噁心、吃不下，盡快讓醫師檢查電解質與尿毒素。', '少量多餐與清淡飲食，避免高鹽高油加重負擔。'],
  },
  {
    id: 'edema',
    title: '水腫',
    tagline: '腳踝、眼皮、手指腫脹',
    detail: '腎臟無法有效排水與排鈉，會讓下肢、眼皮或手指出現壓痕水腫。',
    icon: '💧',
    actions: ['每天量體重與下肢腫脹情況，異常時回診評估利尿劑或飲水量。', '減少鹽分攝取、避免高鈉加工品，依醫囑控制水分。'],
  },
  {
    id: 'breath',
    title: '氣喘胸悶',
    tagline: '水分堆積或血紅素下降',
    detail: '肺水腫或貧血會讓呼吸變淺、胸悶，活動時更明顯。',
    icon: '😮‍💨',
    actions: ['若突然喘不過氣、躺不平，立刻就醫；告知腎功能與用藥。', '按時服藥、遵循限水限鹽，保持規律透析或回診。'],
  },
  {
    id: 'nocturia',
    title: '夜間頻尿',
    tagline: '夜裡跑好幾趟廁所',
    detail: '腎臟濃縮尿液的能力下降，導致晚上排尿次數增加，睡眠被打斷。',
    icon: '🌙',
    actions: ['記錄夜間尿量與次數，和醫師討論是否需要調整藥物或飲水時機。', '睡前 2–3 小時減少大量飲水與含咖啡因飲品。'],
  },
  {
    id: 'skin',
    title: '皮膚病變',
    tagline: '搔癢、乾燥或色素沉著',
    detail: '尿毒素、鈣磷失衡可能造成全身搔癢或皮膚顏色改變。',
    icon: '🩹',
    actions: ['避免抓破皮，保持皮膚滋潤；必要時向醫師反映搔癢程度。', '遵守限磷飲食與藥物，穩定鈣磷有助減少搔癢。'],
  },
  {
    id: 'foam',
    title: '泡泡尿',
    tagline: '蛋白流失的警訊',
    detail: '持續出現大量持久的泡沫尿，可能代表蛋白質從尿液流失，腎絲球受損。',
    icon: '🫧',
    actions: ['拍照或紀錄泡沫情況，回診檢查尿蛋白/尿白蛋白。', '控制血壓、血糖與鹽分攝取，可減緩蛋白尿惡化。'],
  },
  {
    id: 'cramp',
    title: '抽筋',
    tagline: '電解質或液體失衡',
    detail: '腎臟排鉀排鈉異常或液體快速變化，容易在夜間或透析時抽筋。',
    icon: '🦵',
    actions: ['抽筋頻繁時與醫師討論電解質與透析設定，不要自行補高鉀食物。', '熱敷與伸展能暫時緩解，但根本解方是調整體液與電解質。'],
  },
  {
    id: 'fatigue',
    title: '疲勞嗜睡',
    tagline: '貧血或毒素累積造成',
    detail: '血紅素低或代謝物堆積會讓人容易疲倦、無力、想睡，專注力也下降。',
    icon: '😴',
    actions: ['定期檢查血紅素與鐵儲存，遵醫囑補鐵或使用促紅素。', '保持規律作息與均衡飲食，減少高鹽高油，避免加重代謝負擔。'],
  },
  {
    id: 'dizzy',
    title: '頭暈',
    tagline: '血壓或體液平衡異常',
    detail: '站起來眼前發黑、頭暈，可能是血壓過低、體液不足或貧血；也可能是高血壓未控制好。',
    icon: '🌀',
    actions: ['量血壓並紀錄，若偏低或波動大，與醫師討論藥物與飲水量。', '頭暈伴隨心悸、胸悶或昏厥風險時立刻就醫，並說明腎功能狀態。'],
  },
]

const quizAnswers = ['a', 'c', 'e']

export function Stage11() {
  const navigate = useNavigate()
  const stageId = 'stage11'
  const prevPath = '/journey/stage10'
  const nextPath = '/journey/stage12'

  const saved = getStageState<Stage11State>(stageId)

  const [visitedSymptoms, setVisitedSymptoms] = useState<string[]>(() => saved?.visitedSymptoms ?? [])
  const [activeSymptomId, setActiveSymptomId] = useState<string>(() => saved?.activeSymptomId ?? symptoms[0].id)

  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [quizState, setQuizState] = useState<'idle' | 'wrong' | 'correct'>('idle')
  const [quizError, setQuizError] = useState<string | null>(null)
  const [gateNotice, setGateNotice] = useState<string | null>(null)

  const activeSymptom = useMemo(() => symptoms.find((s) => s.id === activeSymptomId) ?? symptoms[0], [activeSymptomId])
  const visitedAll = visitedSymptoms.length === symptoms.length
  const progressPercent = Math.round((visitedSymptoms.length / symptoms.length) * 100)

  useEffect(() => {
    resolveLockedRedirectPath(stageId).then((path) => {
      if (path) navigate(path, { replace: true })
    })
  }, [navigate])

  useEffect(() => {
    getStageUnlocked(stageId).then(setIsUnlocked)
  }, [])

  useEffect(() => {
    setStageState<Stage11State>(stageId, { visitedSymptoms, activeSymptomId })
  }, [visitedSymptoms, activeSymptomId])

  const handleSymptomClick = (id: string) => {
    setActiveSymptomId(id)
    setVisitedSymptoms((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setGateNotice(null)
  }

  const handleResetStickers = () => {
    setVisitedSymptoms([])
    setActiveSymptomId(symptoms[0].id)
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
      setQuizError('答案不正確，再試一次。提示：留意腎臟病常見警訊。')
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
          <p className="text-sm uppercase tracking-[0.4em] text-rose-500">Stage 11 / 腎臟病併發症</p>
          <h1 className="text-3xl font-black text-rose-800">腎臟在呼救：抓住 9 個警訊</h1>
          <p className="text-slate-600">
            噁心、水腫、氣喘、夜間頻尿、泡泡尿、抽筋、皮膚搔癢、疲勞、頭暈，可能都是腎臟在求救。點擊貼紙收集警訊並學會應對。
          </p>
          {gateNotice && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{gateNotice}</div>}
        </header>

        <section className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6 items-start">
          <div className="bg-white/85 rounded-3xl shadow-lg p-8 border border-rose-100 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-rose-500">症狀貼紙牆</p>
                <h2 className="text-xl font-black text-slate-900">點貼紙，看警訊</h2>
                <p className="text-sm text-slate-600">每開一張貼紙，右側會顯示細節與應對行動。</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.25em] text-rose-500">收集進度</p>
                  <p className="text-3xl font-black text-rose-700">{progressPercent}%</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleResetStickers}
                  className="border-rose-200 text-rose-700 bg-white hover:bg-rose-50 cursor-pointer"
                >
                  🔄 重製貼紙
                </Button>
              </div>
            </div>
            <div className="h-3 rounded-full bg-rose-100 overflow-hidden">
              <div className="h-full bg-rose-400 transition-all duration-500" style={{ width: `${progressPercent}%` }} aria-label={`已完成 ${progressPercent}%`}></div>
            </div>

            <div className="relative w-full max-w-3xl mx-auto">
              <div className="relative w-full aspect-square max-w-xl mx-auto">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-44 h-44 rounded-full bg-white/80 border border-rose-100 shadow-inner overflow-hidden relative">
                    <img
                      src="/images/img6.png"
                      alt="腎臟警訊插畫"
                      className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ${visitedAll ? 'opacity-0' : 'opacity-100'}`}
                    />
                    <img
                      src="/images/img7.png"
                      alt="腎臟改善插畫"
                      className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ${visitedAll ? 'opacity-100' : 'opacity-0'}`}
                    />
                  </div>
                </div>
                {symptoms.map((symptom, idx) => {
                  const angle = (idx / symptoms.length) * Math.PI * 2
                  const radius = 38
                  const x = 50 + radius * Math.cos(angle)
                  const y = 50 + radius * Math.sin(angle)
                  const isVisited = visitedSymptoms.includes(symptom.id)
                  const isActive = activeSymptomId === symptom.id
                  return (
                    <button
                      key={symptom.id}
                      onClick={() => handleSymptomClick(symptom.id)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex flex-col items-center justify-center text-center text-sm font-semibold shadow-md transition-all duration-300 cursor-pointer ${
                        isActive ? 'ring-4 ring-rose-200 scale-105' : 'hover:scale-105'
                      } ${isVisited ? 'bg-amber-100 border-amber-200 text-rose-800' : 'bg-rose-50 border border-rose-200 text-rose-700'}`}
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      <span className="text-xl">{symptom.icon}</span>
                      <span className="mt-1">{symptom.title}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`rounded-3xl border bg-white/90 shadow-lg p-6 space-y-5 ${visitedAll ? 'border-emerald-200' : 'border-rose-100'}`}>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center text-2xl">{activeSymptom.icon}</div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-rose-500">{visitedSymptoms.includes(activeSymptom.id) ? '已收藏貼紙' : '待探索'}</p>
                  <h3 className="text-2xl font-bold text-slate-900">{activeSymptom.title}</h3>
                  <p className="text-sm text-slate-600">{activeSymptom.tagline}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3 text-sm text-rose-800">{activeSymptom.detail}</div>

              <div className="space-y-3">
                {activeSymptom.actions.map((step, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <span className="h-8 w-8 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center">{idx + 1}</span>
                    <p className="text-slate-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-rose-100 bg-white shadow-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-lg">📒</div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">收集貼紙</p>
                  <h3 className="text-lg font-bold text-slate-900">已探索的警訊</h3>
                </div>
              </div>
              {visitedSymptoms.length === 0 ? (
                <p className="text-sm text-slate-600">尚未收集任何貼紙，點擊圓圈貼紙開始探索。</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {symptoms
                    .filter((symptom) => visitedSymptoms.includes(symptom.id))
                    .map((symptom) => (
                      <span
                        key={symptom.id}
                        className="px-3 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 shadow-sm flex items-center gap-2"
                      >
                        <span className="text-base">{symptom.icon}</span>
                        <span className="font-semibold">{symptom.title}</span>
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
            <p className="text-sm uppercase tracking-[0.3em] text-rose-500">Stage 11 問題</p>
            <h3 className="text-xl font-semibold text-slate-900">腎臟求救時，哪些作法正確？（可複選）</h3>
            <p className="text-sm text-slate-600 leading-relaxed">勾選所有能減少併發症惡化的行動。</p>
            <div className="grid gap-2">
              {[
                { id: 'a', label: '突然水腫或喘不過氣時，盡快就醫並告知腎功能' },
                { id: 'b', label: '泡泡尿或夜間頻尿可忽略，等到有痛才看醫生' },
                { id: 'c', label: '透析或回診時主動分享抽筋、搔癢等新症狀' },
                { id: 'd', label: '搔癢就多吃含磷零食，反正跟腎臟無關' },
                { id: 'e', label: '按時量體重、血壓與尿量變化，異常時回診討論' },
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
                    name="stage11-quiz"
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
