import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { getStageUnlocked, setStageUnlocked } from '../lib/journeyProgress'

type Plan = {
  minutesPerDay: number
  daysPerWeek: number
}

const stageInfo: Record<
  'early' | 'mid' | 'late',
  { label: string; summary: string; caution: string; suggestions: string }
> = {
  early: {
    label: '慢性腎臟病第一、二期',
    summary: '大多數運動都還可以執行，建議多做肌力訓練。',
    caution: '不要每天連續運動，給腎臟休息時間。',
    suggestions: '重訓、游泳、球類運動皆可',
  },
  mid: {
    label: '慢性腎臟病第三、四期',
    summary: '建議多做心肺耐力訓練。',
    caution: '不要過累。',
    suggestions: '登山健行、腳踏車',
  },
  late: {
    label: '慢性腎臟病第五期',
    summary: '牽拉伸展運動較為安全。',
    caution: '動作慢且緩，休息時間要拉長。',
    suggestions: '瑜伽、太極拳',
  },
}

export function Stage5() {
  const navigate = useNavigate()
  const [plan, setPlan] = useState<Plan>({ minutesPerDay: 0, daysPerWeek: 0 })
  const [selectedStage, setSelectedStage] = useState<'early' | 'mid' | 'late'>('early')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizState, setQuizState] = useState<'idle' | 'wrong' | 'correct'>('idle')

  useEffect(() => {
    getStageUnlocked('stage5').then((unlocked) => setIsUnlocked(unlocked))
  }, [])

  const weeklyMinutes = useMemo(() => plan.minutesPerDay * plan.daysPerWeek, [plan])
  const percent = Math.min(100, Math.round((weeklyMinutes / 150) * 100))
  const isGoal = weeklyMinutes >= 150

  const handleQuiz = () => {
    if (!isUnlocked) {
      setQuizState('idle')
      setQuizOpen(true)
      return
    }
    navigate('/journey/stage6')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 py-16 px-4 text-slate-800 relative overflow-hidden">
      <Button
        variant="ghost"
        onClick={() => navigate('/journey/stage4')}
        className="fixed top-20 left-4 z-30 bg-white/70 backdrop-blur border border-white hover:bg-white shadow-sm"
      >
        ← 回到上一關
      </Button>

      <button
        aria-label={isUnlocked ? '前往下一關' : '解鎖下一關'}
        onClick={handleQuiz}
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
          <p className="text-sm uppercase tracking-[0.4em] text-rose-500">Stage 05 / 腎腎運動去</p>
          <h1 className="text-3xl font-black text-rose-800">規律並且持續，運動很重要！</h1>
          <p className="text-slate-600">設定你的每週運動計畫，選擇適合期別的運動類型，看看是否達到「每週至少 150 分鐘」的目標。</p>
        </header>

        <section className="bg-white rounded-3xl shadow-lg p-8 border border-rose-100 space-y-8">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] items-start">
            <div className="space-y-6">
              <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-white to-rose-50 p-6 shadow-inner space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-rose-100 bg-white p-4 text-center shadow-sm">
                    <p className="text-sm text-slate-600">每次運動</p>
                    <p className="text-2xl font-black text-rose-700">20-30</p>
                    <p className="text-xs text-slate-500">分鐘</p>
                  </div>
                  <div className="rounded-2xl border border-rose-100 bg-white p-4 text-center shadow-sm">
                    <p className="text-sm text-slate-600">每週</p>
                    <p className="text-2xl font-black text-rose-700">3</p>
                    <p className="text-xs text-slate-500">次</p>
                  </div>
                  <div className="rounded-2xl border border-rose-100 bg-white p-4 text-center shadow-sm">
                    <p className="text-sm text-slate-600">累積</p>
                    <p className="text-2xl font-black text-rose-700">≥150</p>
                    <p className="text-xs text-slate-500">分鐘 / 週</p>
                  </div>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">採漸進式，每週至少 150 分鐘，不要每天連續運動，給腎臟休息時間。</p>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">設定你的運動計畫</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="text-sm font-semibold text-slate-900">每次運動（分鐘）</span>
                    <input
                      type="number"
                      min={0}
                      value={plan.minutesPerDay}
                      onChange={(e) => setPlan((p) => ({ ...p, minutesPerDay: Math.max(0, Number(e.target.value) || 0) }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none transition-all focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-sm font-semibold text-slate-900">每週次數</span>
                    <input
                      type="number"
                      min={0}
                      value={plan.daysPerWeek}
                      onChange={(e) => setPlan((p) => ({ ...p, daysPerWeek: Math.max(0, Number(e.target.value) || 0) }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 outline-none transition-all focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-white to-rose-50 p-6 shadow-inner space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">依期別挑選運動</h3>
                <div className="flex gap-2 flex-wrap">
                  {(['early', 'mid', 'late'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedStage(s)}
                      className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                        selectedStage === s ? 'border-rose-400 bg-rose-50 shadow-sm' : 'border-slate-200 bg-white hover:border-rose-200'
                      }`}
                    >
                      <p className="font-semibold text-slate-900">{stageInfo[s].label}</p>
                    </button>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-3 text-sm text-slate-800">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                    <p className="text-xs uppercase tracking-[0.25em] text-rose-500">運動類型建議</p>
                    <p className="leading-relaxed">{stageInfo[selectedStage].summary}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                    <p className="text-xs uppercase tracking-[0.25em] text-rose-500">注意事項</p>
                    <p className="leading-relaxed">{stageInfo[selectedStage].caution}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                    <p className="text-xs uppercase tracking-[0.25em] text-rose-500">運動建議</p>
                    <p className="leading-relaxed">{stageInfo[selectedStage].suggestions}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-white to-rose-50 p-6 shadow-inner space-y-4">
                <p className="text-xs uppercase tracking-[0.4em] text-rose-500">結果</p>
                <h3 className="text-xl font-semibold text-slate-900">這樣的運動量足夠嗎？</h3>
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="text-sm text-slate-600">每週累積</p>
                  <p className="text-3xl font-black text-slate-900">{weeklyMinutes} 分鐘</p>
                  <p className="text-sm text-slate-600">建議至少 150 分鐘 / 週</p>
                  <div className="mt-3">
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full ${isGoal ? 'bg-emerald-500' : 'bg-amber-400'}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">
                    {isGoal ? '已達每週 150 分鐘的目標，保持規律就好！' : '尚未達標，嘗試增加每次時間或每週次數，循序漸進。'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2 text-sm text-slate-700 leading-relaxed">
                  <p className="font-semibold text-slate-900">注意事項</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>不要每天連續運動，給腎臟休息時間。</li>
                    <li>動作慢且緩，休息時間要拉長；避免過累。</li>
                    <li>出現不適（胸悶、暈眩、腳踝腫）應停止並諮詢醫師。</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2 text-sm text-slate-700 leading-relaxed">
                  <p className="font-semibold text-slate-900">任務檢核</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>是否已設定「每次」與「每週」的運動時間？</li>
                    <li>是否達到每週 150 分鐘的目標？</li>
                    <li>是否已勾選適合期別的運動種類？</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {quizOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-500">Stage 5 問題</p>
            <h3 className="text-xl font-semibold text-slate-900">解鎖下一關</h3>
            <p className="text-sm text-slate-600 leading-relaxed">題目：每週建議至少累積多少分鐘的運動量才符合簡報的目標？</p>

            <div className="grid gap-2">
              {[
                { id: 'a', label: '50 分鐘' },
                { id: 'b', label: '100 分鐘' },
                { id: 'c', label: '150 分鐘' },
                { id: 'd', label: '300 分鐘' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    const correct = opt.id === 'c'
                    if (!correct) {
                      setQuizState('wrong')
                      return
                    }
                    setQuizState('correct')
                    void setStageUnlocked('stage5', true)
                    setIsUnlocked(true)
                  }}
                  className="w-full text-left rounded-2xl border border-slate-200 bg-white px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-200 cursor-pointer"
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
                解鎖成功！再點右側箭頭即可進入下一關。
              </div>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <Button variant="ghost" onClick={() => setQuizOpen(false)}>
                關閉
              </Button>
              {quizState === 'correct' && (
                <Button onClick={() => navigate('/journey/stage6')} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6">
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
