import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'

type JourneyStage = {
  title: string
  description: string
  icon: string
  gradient: string
  border: string
  ring?: 'inner' | 'outer'
  customAngle?: number
  customRadius?: number
  sizeClass?: string
  countsAsStage?: boolean
}

type PositionedStage = JourneyStage & {
  angle: number
  left: number
  top: number
  delay: number
  sizeClass: string
  stageNumber?: number
}

const journeyStages: JourneyStage[] = [
  {
    title: '起點｜腎友新手村',
    description: '了解腎臟冒險的流程。',
    icon: '🏕️',
    gradient: 'from-rose-50 via-rose-100 to-orange-100',
    border: 'border-rose-200',
    ring: 'outer',
    countsAsStage: false,
  },
  {
    title: '認識腎臟',
    description: '透過圖解與互動小測驗，了解腎臟結構、過濾與調節的超能力。',
    icon: '🔬',
    gradient: 'from-sky-50 via-sky-100 to-blue-100',
    border: 'border-sky-200',
    ring: 'outer',
  },
  {
    title: '功能解讀所',
    description: '練習閱讀 eGFR、肌酐與尿蛋白，知道每個數字意味著什麼。',
    icon: '📊',
    gradient: 'from-cyan-50 via-cyan-100 to-sky-100',
    border: 'border-cyan-200',
    ring: 'outer',
  },
  {
    title: '腎臟病有徵兆',
    description: '從水腫、泡泡尿、疲倦到食慾差，學會辨識早期警訊。',
    icon: '🚨',
    gradient: 'from-indigo-50 via-indigo-100 to-purple-100',
    border: 'border-indigo-200',
    ring: 'outer',
  },
  {
    title: '你喝對水了嗎？',
    description: '用體重換算每日飲水量，學習分次補水、避開含糖飲料。',
    icon: '🥤',
    gradient: 'from-emerald-50 via-emerald-100 to-teal-100',
    border: 'border-teal-200',
    ring: 'inner',
  },
  {
    title: '腎腎運動去',
    description: '結合暖身、彈力帶與呼吸調整的 10 分鐘居家運動菜單。',
    icon: '🏃‍♀️',
    gradient: 'from-green-50 via-green-100 to-lime-100',
    border: 'border-lime-200',
    ring: 'inner',
  },
  {
    title: '三高控制好，腎臟才有保',
    description: '以每日自我監測＋飲食調整，維持血壓、血糖、血脂三穩。',
    icon: '🫀',
    gradient: 'from-lime-50 via-amber-50 to-emerald-100',
    border: 'border-lime-200',
    ring: 'inner',
  },
  {
    title: '飲食迷失站',
    description: '拆解蛋白質、鈉、鉀、磷迷思，設計腎友友善餐盤。',
    icon: '🥗',
    gradient: 'from-amber-50 via-yellow-50 to-orange-50',
    border: 'border-amber-200',
    ring: 'inner',
  },
  {
    title: '藥品檢驗所',
    description: '整理常見藥物與檢查，了解作用、副作用與追蹤頻率。',
    icon: '💊',
    gradient: 'from-yellow-50 via-amber-100 to-orange-100',
    border: 'border-yellow-200',
    ring: 'inner',
  },
  {
    title: '預防感染很重要',
    description: '練習洗手、疫苗、口罩與日常清潔，讓免疫守門員升級。',
    icon: '🦠',
    gradient: 'from-orange-50 via-rose-50 to-amber-100',
    border: 'border-orange-200',
    ring: 'inner',
  },
  {
    title: '命運分岔路',
    description: '面對腎功能變化，與團隊討論飲食、藥物與治療的下一步。',
    icon: '🧭',
    gradient: 'from-pink-50 via-rose-100 to-amber-100',
    border: 'border-rose-200',
    ring: 'outer',
  },
  {
    title: '臉色蒼白',
    description: '若出現臉色白、頭暈或疲倦要警覺，可能是貧血或營養不足。',
    icon: '😷',
    gradient: 'from-red-50 via-orange-50 to-rose-100',
    border: 'border-rose-300',
    ring: 'outer',
  },
  {
    title: '腎臟病併發症',
    description: '透過案例認識骨鬆、心血管與神經併發症，提前預防。',
    icon: '🩺',
    gradient: 'from-orange-100 via-amber-100 to-red-100',
    border: 'border-orange-300',
    ring: 'outer',
  },
  {
    title: '我該透析了嗎？我有什麼選擇？',
    description: '認識血液透析、腹膜透析與移植流程，擬定生活與治療的平衡。',
    icon: '🤗',
    gradient: 'from-rose-50 via-pink-100 to-orange-100',
    border: 'border-rose-200',
    ring: 'outer',
  },
]

const piCareTips = [
  {
    digit: '3',
    title: '腎病三問早知道',
    detail: '腎臟功能、抽血報告、腎臟病症狀',
  },
  {
    digit: '1',
    title: '定喝水要足夠',
    detail: '正確喝水為起點',
  },
  {
    digit: '4',
    title: '力齊發防惡化',
    detail: '運動、三高控制、飲食、預防感染',
  },
  {
    digit: '1',
    title: '再檢視讓安心',
    detail: '醫療檢視與追蹤',
  },
  {
    digit: '5',
    title: '大警訊須留意',
    detail: '需開始透析的症狀：臉色蒼白、噁心、嘔吐、呼吸喘、透析抉擇',
  },
  {
    digit: '9',
    title: '成民眾易忽略，定期追蹤才安心。',
    detail: '腎病早期症狀不明顯',
  },
]

function KidneyMascot() {
  return (
    <svg
      viewBox="0 0 220 160"
      className="w-52 h-44 mx-auto animate-float-slow"
      role="img"
      aria-label="可愛的腎臟拍檔"
    >
      <defs>
        <linearGradient id="kidneyLeft" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffb5c9" />
          <stop offset="100%" stopColor="#f87171" />
        </linearGradient>
        <linearGradient id="kidneyRight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c4e1ff" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
      </defs>
      <path
        d="M75 30 C50 30 40 60 40 90 C40 125 60 140 85 140 C110 140 125 125 125 95 C125 65 110 30 75 30 Z"
        fill="url(#kidneyLeft)"
        stroke="#fb7185"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M145 30 C170 30 180 60 180 90 C180 125 160 140 135 140 C110 140 95 125 95 95 C95 65 110 30 145 30 Z"
        fill="url(#kidneyRight)"
        stroke="#60a5fa"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="162" cy="82" r="12" fill="#fde047" stroke="#facc15" strokeWidth="4" />
      <circle cx="58" cy="82" r="12" fill="#fb7185" stroke="#f43f5e" strokeWidth="4" />
      <circle cx="82" cy="82" r="6" fill="#1f2937" />
      <circle cx="134" cy="82" r="6" fill="#1f2937" />
      <path d="M72 102 Q85 112 98 102" stroke="#1f2937" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M118 102 Q131 112 144 102" stroke="#1f2937" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M105 95 Q110 105 115 95" stroke="#f43f5e" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path
        d="M103 57 C112 52 118 52 127 57"
        stroke="#f472b6"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M103 120 C110 130 118 130 125 120"
        stroke="#f472b6"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Stage0() {
  const totalStages = journeyStages.length
  const angleStep = 360 / totalStages
  const baseAngle = -90
  const baseRadius = 45

  let stageCounter = 0
  const positionedStages: PositionedStage[] = journeyStages.map((stage, index) => {
    const angle = (stage.customAngle ?? (baseAngle + index * angleStep))
    const radius = stage.customRadius ?? baseRadius
    const radians = angle * (Math.PI / 180)
    const left = 50 + radius * Math.cos(radians)
    const top = 50 + radius * Math.sin(radians)
    const countsAsStage = stage.countsAsStage !== false
    const stageNumber = countsAsStage ? ++stageCounter : undefined

    return {
      ...stage,
      angle,
      left,
      top,
      delay: index * 0.15,
      sizeClass: stage.sizeClass ?? 'w-32 sm:w-36 lg:w-40',
      stageNumber,
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-orange-50/70 to-blue-50 py-20 px-4 text-slate-800">
      <div className="max-w-6xl mx-auto">
        <section className="text-center space-y-4">
          <p className="text-sm font-semibold tracking-[0.35em] text-rose-500 animate-pulse">
            π = 3.14159 腎臟照護密碼
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-rose-800">與腎同行的冒險之旅</h1>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button
              asChild
              className="px-8 py-6 text-base bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 shadow-lg hover:opacity-90"
            >
              <Link to="/journey#map">立即開始闖關</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="px-8 py-6 text-base bg-white/70 backdrop-blur"
            >
              <Link to="/">回到首頁</Link>
            </Button>
          </div>
        </section>

        <section id="map" className="mt-16">
          <div className="relative mx-auto aspect-square max-w-4xl">
            <div className="absolute inset-6 rounded-full border border-rose-200/60 animate-orbit-slow"></div>
            <div className="absolute inset-14 rounded-full border border-dashed border-rose-200/50"></div>
            <div className="absolute inset-24 rounded-full bg-white/80 shadow-2xl flex flex-col items-center justify-center text-center p-10 gap-3 animate-float-slow">
              <KidneyMascot />
              <h3 className="text-2xl font-bold text-rose-700">腎臟拍檔</h3>
              <p className="text-sm text-slate-600">
                兩顆腎像擁有默契的隊友，透過補水、飲食、運動與篩檢的任務，一步步換來穩定的生活。
              </p>
            </div>

            {positionedStages.map((stage) => (
              <div
                key={stage.title}
                className={`absolute -translate-x-1/2 -translate-y-1/2 ${stage.sizeClass}`}
                style={{ top: `${stage.top}%`, left: `${stage.left}%` }}
              >
                <div
                  className={`bg-gradient-to-br ${stage.gradient} ${stage.border} border-2 rounded-2xl p-3 shadow-lg backdrop-blur-sm transition-transform duration-500 hover:-translate-y-1 ${
                    stage.ring === 'inner' ? 'animate-float-slow' : 'animate-float-slower'
                  }`}
                  style={{ animationDelay: `${stage.delay}s` }}
                >
                  <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-slate-500 mb-2">
                    <span>
                      {stage.stageNumber
                        ? `Stage ${String(stage.stageNumber).padStart(2, '0')}`
                        : 'Stage 0'}
                    </span>
                    <span className="text-lg">{stage.icon}</span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-800">{stage.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">{stage.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="rounded-3xl bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 border border-rose-100/70 shadow-lg p-8 space-y-6">
            <div className="flex flex-wrap items-baseline gap-3 text-rose-800">
              <p className="text-xl font-semibold tracking-[0.35em] uppercase text-rose-500">π = 3.14159</p>
              <h2 className="text-3xl font-black">腎臟照護口訣</h2>
            </div>
            <div className="space-y-3">
              {piCareTips.map((tip) => (
                <div
                  key={`${tip.digit}-${tip.title}`}
                  className="flex items-start gap-4 rounded-2xl border border-rose-100 bg-white/90 p-4 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white font-black text-xl flex items-center justify-center">
                    {tip.digit}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-rose-700">
                      {tip.title}
                    </p>
                    <p className="text-sm text-slate-600">{tip.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
