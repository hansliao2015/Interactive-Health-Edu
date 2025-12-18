import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { getStageUnlocked, setStageUnlocked } from '../lib/journeyProgress'
import { resolveLockedRedirectPath } from '../lib/journeyGuard'
import { getStageState, setStageState } from '../lib/stageState'

type Option = {
  id: string
  title: string
  tagline: string
  icon: string
  detail: string
  steps: string[]
  caution: string
}

type Stage13State = {
  visited: string[]
  activeId: string
}

const options: Option[] = [
  {
    id: 'hd',
    title: '血液透析（HD）',
    tagline: '定期到透析中心，機器代替腎臟過濾',
    icon: '💉',
    detail: '經由血管通路（動靜脈廔管或導管），每週多次到透析中心，讓機器移除毒素與多餘水分。',
    steps: ['需建立良好血管通路並定期保養。', '固定時段透析，留意透析後血壓、體重與症狀。', '飲食與水分控制需配合醫療團隊建議。'],
    caution: '若有發燒、血管腫痛或透析後嚴重不適，要盡快告知醫護。',
  },
  {
    id: 'pd',
    title: '腹膜透析（PD）',
    tagline: '利用自己的腹膜作濾網，居家自行交換透析液',
    icon: '🫧',
    detail: '在腹腔植入導管，利用腹膜與透析液進行物質交換，常見作法為每日多次交換或夜間自動腹透。',
    steps: ['學習無菌操作，交換透析液前後確實洗手與戴口罩。', '監測出入口紅腫、透析液混濁或腹痛，異常立即聯絡醫療團隊。', '儲液與操作環境保持乾淨通風。'],
    caution: '出現腹痛、發燒或透析液變混濁，可能是腹膜炎，需立即就醫。',
  },
  {
    id: 'tx',
    title: '腎臟移植',
    tagline: '重啟腎功能，但需長期免疫抑制劑',
    icon: '🫀',
    detail: '透過活體或屍體捐贈移植一顆腎臟，重啟過濾功能，長期服用免疫抑制劑以防排斥。',
    steps: ['移植前評估配對與身體狀況。', '術後按時服藥、追蹤血藥濃度與腎功能。', '注意感染風險，生活衛生與疫苗按醫囑進行。'],
    caution: '免疫抑制劑不可任意停藥或減量，定期回診是關鍵。',
  },
  {
    id: 'pc',
    title: '支持性/安寧療護',
    tagline: '討論生活品質，緩解症狀為優先',
    icon: '🤝',
    detail: '當透析或移植不適合時，可與團隊討論支持性照護，聚焦症狀緩解、營養與舒適，尊重個人意願。',
    steps: ['與醫師、護理師、家人討論目標與照護計畫。', '定期追蹤症狀（喘、腫、痛）與用藥調整。', '需要時尋求營養、心理與社工支持。'],
    caution: '支持性療護同樣需要專業團隊陪伴，並非「放棄治療」。',
  },
]

const quizAnswers = ['a', 'c', 'e']

export function Stage13() {
  const navigate = useNavigate()
  const stageId = 'stage13'
  const prevPath = '/journey/stage12'
  const nextPath = '/journey' // 最終關，完成後回總覽

  const saved = getStageState<Stage13State>(stageId)
  const [visited, setVisited] = useState<string[]>(() => saved?.visited ?? [])
  const [activeId, setActiveId] = useState<string>(() => saved?.activeId ?? options[0].id)

  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [quizState, setQuizState] = useState<'idle' | 'wrong' | 'correct'>('idle')
  const [quizError, setQuizError] = useState<string | null>(null)
  const [gateNotice, setGateNotice] = useState<string | null>(null)

  const activeOption = useMemo(() => options.find((o) => o.id === activeId) ?? options[0], [activeId])
  const visitedAll = visited.length === options.length

  useEffect(() => {
    resolveLockedRedirectPath(stageId).then((path) => {
      if (path) navigate(path, { replace: true })
    })
  }, [navigate])

  useEffect(() => {
    getStageUnlocked(stageId).then(setIsUnlocked)
  }, [])

  useEffect(() => {
    setStageState<Stage13State>(stageId, { visited, activeId })
  }, [visited, activeId])

  const handleSelect = (id: string) => {
    setActiveId(id)
    setVisited((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setGateNotice(null)
  }

  const handleArrowClick = () => {
    if (isUnlocked) {
      navigate(nextPath)
      return
    }
    if (!visitedAll) {
      setGateNotice('請先了解四種路線（血液透析、腹膜透析、移植、支持性療護），再來解鎖。')
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
      setQuizError('答案不正確，再試一次。提示：想想不同路線的操作與風險。')
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
        aria-label={isUnlocked ? '回到總覽' : '解鎖本關'}
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
          <p className="text-sm uppercase tracking-[0.4em] text-rose-500">Stage 13 / 我該透析了嗎？</p>
          <h1 className="text-3xl font-black text-rose-800">終局抉擇：HD、PD、移植或支持性療護</h1>
          <p className="text-slate-600">
            腎臟進入末期時，常見路線有血液透析、腹膜透析、腎臟移植與支持性/安寧療護。每條路線都有不同生活節奏與風險，先看懂再選擇。
          </p>
          {gateNotice && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{gateNotice}</div>}
        </header>

        <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <div className="bg-white/85 rounded-3xl shadow-lg p-8 border border-rose-100 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-rose-500">路線切換</p>
                <h2 className="text-xl font-black text-slate-900">點圓圈切換四條路線</h2>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-2 text-sm text-emerald-800">已瀏覽：{visited.length}/4</div>
            </div>

            <div className="flex items-center gap-3">
              {options.map((option, idx) => {
                const isActive = activeId === option.id
                const isVisited = visited.includes(option.id)
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className={`w-12 h-12 rounded-full border text-sm font-bold flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md scale-105'
                        : isVisited
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-rose-200'
                    }`}
                    aria-label={option.title}
                    title={option.title}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>

            <div className="grid lg:grid-cols-[1fr_0.9fr] gap-6">
              <div className="rounded-3xl border border-rose-100 bg-rose-50/70 p-5 space-y-3 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center text-2xl">{activeOption.icon}</div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-rose-500">{visited.includes(activeOption.id) ? '已閱讀' : '待探索'}</p>
                    <h3 className="text-xl font-bold text-slate-900">{activeOption.title}</h3>
                    <p className="text-sm text-slate-600">{activeOption.tagline}</p>
                  </div>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{activeOption.detail}</p>
                <div className="space-y-3">
                  {activeOption.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <span className="h-8 w-8 rounded-full bg-white text-rose-700 font-bold flex items-center justify-center">{idx + 1}</span>
                      <p className="text-slate-700 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{activeOption.caution}</div>
              </div>

              <div className="relative rounded-3xl border border-rose-100 bg-white shadow-inner overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,#fb7185,transparent_35%),radial-gradient(circle_at_70%_60%,#60a5fa,transparent_40%)]" />
                <div className="relative p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-lg">📝</div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">決策清單</p>
                      <h3 className="text-lg font-bold text-slate-900">想一想這些問題</h3>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>• 我的生活型態更適合固定場域（HD）還是居家（PD）？</li>
                    <li>• 我是否有移植意願與配對條件？家人支持度如何？</li>
                    <li>• 感染風險、通路照護、免疫抑制藥的副作用，我能否接受？</li>
                    <li>• 若身體狀況無法承受透析，支持性/安寧療護是否符合我的目標？</li>
                  </ul>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-800">
                    行動：把答案記下來，下次回診帶著問題與醫療團隊討論，共同擬定最適合的路線。
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-rose-100 bg-white shadow-lg p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-lg">⚖️</div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">快速比較</p>
                  <h3 className="text-lg font-bold text-slate-900">治療特點一覽</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3">
                  <p className="font-bold text-rose-700">血液透析</p>
                  <p>固定場域、需血管通路、週期性濾毒/脫水。</p>
                </div>
                <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-3">
                  <p className="font-bold text-sky-700">腹膜透析</p>
                  <p>居家操作、腹膜導管、需無菌技巧。</p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                  <p className="font-bold text-emerald-700">腎臟移植</p>
                  <p>重啟腎功能，需長期免疫抑制、感染警覺。</p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-3">
                  <p className="font-bold text-amber-700">支持性療護</p>
                  <p>聚焦舒適與症狀控制，尊重個人目標。</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-rose-100 bg-white shadow-lg p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-rose-100 flex items-center justify-center text-lg">🧭</div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-rose-600">下一步</p>
                  <h3 className="text-lg font-bold text-slate-900">準備與討論</h3>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• 與腎臟科醫師討論 eGFR、症狀與選項時程。</li>
                <li>• 若偏向 HD，提早安排血管通路；若 PD，討論導管放置與訓練。</li>
                <li>• 若考慮移植，了解配對、候補與術後照護。</li>
                <li>• 若選擇支持性療護，明確告知照護目標與意願書。</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {isQuizOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-500">Stage 13 問題</p>
            <h3 className="text-xl font-semibold text-slate-900">選擇治療路線，哪些說法正確？（可複選）</h3>
            <p className="text-sm text-slate-600 leading-relaxed">勾選所有正確觀念。</p>
            <div className="grid gap-2">
              {[
                { id: 'a', label: '血液透析需要血管通路，固定到透析中心進行' },
                { id: 'b', label: '腹膜透析不需要注意無菌操作，感染風險低' },
                { id: 'c', label: '腎臟移植後要長期使用免疫抑制劑並定期追蹤' },
                { id: 'd', label: '身體無法承受透析時只能硬撐，沒有其他選擇' },
                { id: 'e', label: '支持性/安寧療護重視舒適與意願，是可討論的選項' },
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
                    name="stage13-quiz"
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
                完成本關！你可以按「回總覽」結束冒險。
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
                  回總覽
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
