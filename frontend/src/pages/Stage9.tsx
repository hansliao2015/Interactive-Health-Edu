import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { getStageUnlocked, setStageUnlocked } from '../lib/journeyProgress'
import { resolveLockedRedirectPath } from '../lib/journeyGuard'
import { getStageState, setStageState } from '../lib/stageState'

type HabitCard = {
  id: string
  title: string
  tagline: string
  icon: string
  gradient: string
  border: string
  steps: string[]
  reminders: string[]
}

const habitCards: HabitCard[] = [
  {
    id: 'wash',
    title: '正確洗手',
    tagline: '20 秒完成「內外夾弓大立腕」，腎友避免把病菌帶回身體',
    icon: '🧼',
    gradient: 'from-cyan-50 via-white to-emerald-50',
    border: 'border-cyan-200',
    steps: [
      '掌心、手背、指縫、指背、拇指、指尖、手腕各搓 20 秒',
      '以流動清水沖淨後擦乾，再用 75% 酒精搓揉 20 秒',
      '進食前後、看病或透析前後、回家後、上廁所後一定要洗手',
    ],
    reminders: ['沒有水時可用乾洗手，但手上需無明顯污垢', '腎友免疫力較弱，外出隨身小瓶酒精噴霧更安心'],
  },
  {
    id: 'move',
    title: '規律運動',
    tagline: '每週 150 分鐘中強度，維持免疫力與血壓穩定',
    icon: '🤸‍♂️',
    gradient: 'from-orange-50 via-white to-amber-50',
    border: 'border-orange-200',
    steps: [
      '快走、騎車或居家肌力都可以，累積到每天 30 分鐘',
      '運動前後補水，依腎功能狀況控制量，避免過度疲勞',
      '人多時選擇通風處或戶外，保持安全距離',
    ],
    reminders: ['暖身 5–10 分鐘讓關節醒來，收操放鬆避免酸痛', '不舒服、發燒或血壓不穩時暫停運動，先休息'],
  },
  {
    id: 'mask',
    title: '正確戴罩',
    tagline: '內層親膚外層防水，鼻樑壓緊才算到位，透析/回診必備',
    icon: '😷',
    gradient: 'from-indigo-50 via-white to-sky-50',
    border: 'border-indigo-200',
    steps: [
      '戴口罩前先洗手，覆蓋鼻子、嘴巴、下巴並壓緊鼻樑',
      '口罩濕了或髒了立即更換，不重複使用一次性口罩',
      '脫口罩只碰耳帶，內層向內折好後丟入垃圾桶，醫院、透析室務必全程佩戴',
    ],
    reminders: ['不要把口罩掛在下巴或反覆摸外層', '搭乘大眾運輸、看診或人潮密集時務必全程佩戴'],
  },
  {
    id: 'sleep',
    title: '足夠睡眠',
    tagline: '成人建議 7–9 小時，作息穩定有助血壓與免疫維持',
    icon: '🌙',
    gradient: 'from-rose-50 via-white to-purple-50',
    border: 'border-rose-200',
    steps: [
      '固定睡眠與起床時間，讓身體有穩定節奏',
      '睡前 1 小時遠離 3C、咖啡因，營造昏暗安靜的環境',
      '白天適度日曬與運動，晚上更好入睡',
    ],
    reminders: ['連續熬夜會削弱免疫力，也讓血壓與腎功能更吃力', '常失眠可縮短午睡或尋求專業協助'],
  },
]

const handwashWords = ['內', '外', '夾', '弓', '大', '立', '腕']

type Stage9State = {
  checkedHabits: string[]
  activeHabitId: string
}

export function Stage9() {
  const navigate = useNavigate()
  const stageId = 'stage9'
  const prevPath = '/journey/stage8'
  const nextPath = '/journey/stage10'

  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [quizState, setQuizState] = useState<'idle' | 'wrong' | 'correct'>('idle')
  const [quizError, setQuizError] = useState<string | null>(null)
  const saved = getStageState<Stage9State>('stage9')
  const [checkedHabits, setCheckedHabits] = useState<string[]>(() => saved?.checkedHabits ?? [])
  const [activeHabitId, setActiveHabitId] = useState<string>(() => saved?.activeHabitId ?? habitCards[0].id)
  const [gateNotice, setGateNotice] = useState<string | null>(null)

  const allHabitsChecked = checkedHabits.length === habitCards.length
  const progressPercent = Math.round((checkedHabits.length / habitCards.length) * 100)
  const activeHabit = habitCards.find((habit) => habit.id === activeHabitId) ?? habitCards[0]

  useEffect(() => {
    resolveLockedRedirectPath(stageId).then((path) => {
      if (path) navigate(path, { replace: true })
    })
  }, [navigate])

  useEffect(() => {
    getStageUnlocked(stageId).then(setIsUnlocked)
  }, [])

  useEffect(() => {
    setStageState<Stage9State>('stage9', { checkedHabits, activeHabitId })
  }, [checkedHabits, activeHabitId])

  const handleHabitSelect = (id: string) => {
    setActiveHabitId(id)
    setCheckedHabits((prev) => (prev.includes(id) ? prev : [...prev, id]))
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
          <p className="text-sm uppercase tracking-[0.4em] text-rose-500">Stage 09 / 預防感染很重要</p>
          <h1 className="text-3xl font-black text-rose-800">感染守護站：洗手、運動、戴罩、睡眠</h1>
          <p className="text-slate-600">
            保護自己及他人的四個動作：乾淨的雙手、穩定的活動力、正確的口罩習慣、充足的睡眠。
          </p>
          {gateNotice && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{gateNotice}</div>
          )}
        </header>

        <section className="bg-white/80 rounded-3xl shadow-lg p-8 border border-rose-100 space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">四大關鍵要點</p>
                <h2 className="text-xl font-black text-slate-900">點一張卡，看一個重點</h2>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.25em] text-rose-500">探索進度</p>
                <p className="text-3xl font-black text-rose-700">{progressPercent}%</p>
              </div>
            </div>
            <div className="h-3 rounded-full bg-rose-100 overflow-hidden">
              <div
                className="h-full bg-rose-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
                aria-label={`已完成 ${progressPercent}%`}
              ></div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8">
            <div className="grid sm:grid-cols-2 gap-4">
              {habitCards.map((habit) => {
                const isActive = activeHabitId === habit.id
                const isDone = checkedHabits.includes(habit.id)
                return (
                  <button
                    key={habit.id}
                    onClick={() => handleHabitSelect(habit.id)}
                    className={`text-left rounded-3xl border p-5 shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-1 ${
                      isActive ? 'ring-2 ring-rose-300 shadow-md' : ''
                    } ${habit.border} bg-gradient-to-br ${habit.gradient}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{habit.icon}</span>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{habit.title}</h3>
                        </div>
                      </div>
                      {isDone && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          已閱讀
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-slate-700 leading-relaxed">{habit.tagline}</p>
                  </button>
                )
              })}
            </div>

            <div className={`rounded-3xl border bg-white/90 shadow-sm p-6 space-y-5 ${activeHabit.border}`}>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center text-2xl">{activeHabit.icon}</div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{activeHabit.title}</h3>
                  <p className="text-sm text-slate-600">{activeHabit.tagline}</p>
                </div>
              </div>

              <div className="space-y-3">
                {activeHabit.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <span className="h-8 w-8 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <p className="text-slate-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {activeHabit.reminders.map((reminder, idx) => (
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
              <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-lg">✋</div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-600">洗手 7 字訣</p>
                <h3 className="text-xl font-bold text-slate-900">20 秒完整流程</h3>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {handwashWords.map((word, idx) => (
                <div
                  key={word}
                  className="px-3 py-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-sm font-semibold shadow-sm"
                >
                  {idx + 1}. {word}
                </div>
              ))}
            </div>
              <p className="text-sm text-slate-700 leading-relaxed">
              內（掌心）→外（手背）→夾（指縫）→弓（指背關節）→大（拇指）→立（指尖指甲）→腕（手腕），每一步都要有泡沫並搓滿 20 秒。腎友回診、透析前後更要確實洗手。
            </p>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800">
              小提醒：公共場合觸摸電梯按鈕、扶手、點餐機後，別忘了立刻洗手或使用乾洗手。
            </div>
          </div>
        </section>
      </div>

      {isQuizOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-500">Stage 09 問題</p>
            <h3 className="text-xl font-semibold text-slate-900">解鎖下一關</h3>
            <p className="text-sm text-slate-600 leading-relaxed">哪一個選項描述了正確且有效的感染預防方法，對腎友也同樣重要？</p>
            <div className="grid gap-2">
              {[
                { id: 'a', label: '洗手至少 20 秒，掌心、指縫、手腕都要搓到' },
                { id: 'b', label: '口罩濕了沒關係，晾乾後繼續用' },
                { id: 'c', label: '想省體力就少動，運動反而容易生病' },
                { id: 'd', label: '睡眠不足對免疫力沒影響，只要喝咖啡就好' },
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
                    name="stage9-quiz"
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
