import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { getStageUnlocked, setStageUnlocked } from '../lib/journeyProgress'

type LabRow = {
  id: string
  label: string
  range: string
  description: string
  highlight?: boolean
}

const labRows: LabRow[] = [
  { id: 'hb', label: '血色素（Hb）', range: '11-15 g/dl', description: '評估是否有貧血​' },
  {
    id: 'cr',
    label: '肌酸酐（Cr）',
    range: '0.6-1.3 mg/dl',
    description: '評估腎臟功能。腎功能不良時指數會偏高。​',
    highlight: true,
  },
  {
    id: 'gfr',
    label: '腎絲球過濾率（GFR）',
    range: 'ml/min/1.73m²',
    description: '由肌酸酐依種族、年受年齡及性別計算得之，評估腎臟功能。​',
    highlight: true,
  },
  {
    id: 'bun',
    label: '尿素氮（BUN）',
    range: '7-25 mg/dl',
    description: '配合肌酸酐評估腎臟功能​',
    highlight: true,
  },
  { id: 'alb', label: '白蛋白（Albumin）', range: '3.5-5.0 g/dl', description: '評估營養狀況。​' },
  { id: 'ca', label: '血鈣（Ca）', range: '2.15-2.58 mmol/L', description: '低血鈣易有抽筋​' },
  {
    id: 'p',
    label: '血磷（P）',
    range: '2.5-4.5 mg/dl',
    description: '血磷值偏低會造成全身無力;偏高時皮膚會癢、促進副甲狀腺機能亢進​',
  },
  { id: 'ua', label: '尿酸（UA）', range: '2.3-6.6 mg/dl', description: '尿酸過高可能造成痛風​' },
  { id: 'chol', label: '膽固醇（Chol）', range: '<200 mg/dl', description: '過高易造成動脈硬化、冠狀動脈心臟疾病。​' },
  {
    id: 'tg',
    label: '三酸甘油脂（TG）',
    range: '<150 mg/dl',
    description: '與喝酒、甜食過量有關，過高易急性胰臟炎、動脈硬化。​',
  },
  { id: 'ldl', label: '低密度膽固醇（LDL-C）', range: '<100 mg/dl', description: '增加心血管風險​' },
  {
    id: 'na',
    label: '血鈉（Na）',
    range: '137-153 mEq/L',
    description: '血鈉過低易頭痛、倦怠，嚴重時會抽搐、昏迷。水分不足血鈉易過高​',
  },
  {
    id: 'k',
    label: '血鉀（K）',
    range: '3.5-5.1 mEq/L',
    description: '鉀離子太高會肢體無力、心律不整、甚至心跳停止。太低會造成體無力、腸蠕動變慢及心律不整。​',
  },
  {
    id: 'hba1c',
    label: '糖化血色素（HbA1c）',
    range: '糖尿病 <7%',
    description: '前3個月的平均血糖狀態，糖尿病患建議控制在7%。​',
  },
  {
    id: 'ac',
    label: '空腹血糖（AC sugar）',
    range: '<100 mg/dl\n糖尿病 80-130 mg/dl',
    description: '過高會加速腎功能退化，及併發症發生。（過低亦會產生併發症）​',
  },
  {
    id: 'upcr',
    label: '總蛋白尿（UPCR）',
    range: '<150 mg/dl',
    description: '尿液中代謝的蛋白質量（以尿尿有泡泡呈現）​',
    highlight: true,
  },
  {
    id: 'uacr',
    label: '微量蛋白尿（UACR）',
    range: '<30 mg/g',
    description: '尿液中代謝的蛋白質量（以尿尿有泡泡呈現）​',
    highlight: true,
  },
]

type RiskLevel = 'low' | 'moderate' | 'high' | 'extreme'

const gfrStages = [
  { id: 'G1', label: '第一期', range: '≥90', note: '腎臟功能健康', wheelColor: '#2dd4bf' },
  { id: 'G2', label: '第二期', range: '60-89', note: '功能輕度下降', wheelColor: '#facc15' },
  { id: 'G3a', label: '第三期a', range: '45-59', note: '需要警覺', wheelColor: '#fb923c' },
  { id: 'G3b', label: '第三期b', range: '30-44', note: '進入高風險', wheelColor: '#f87171' },
  { id: 'G4', label: '第四期', range: '15-29', note: '接近腎衰竭', wheelColor: '#ef4444' },
  { id: 'G5', label: '第五期', range: '<15', note: '腎衰竭階段', wheelColor: '#b91c1c' },
]

const albuminStages = [
  { id: 'A1', label: 'A1 正常/輕微', range: '<30 mg/g' },
  { id: 'A2', label: 'A2 中度增加', range: '30-300 mg/g' },
  { id: 'A3', label: 'A3 重度增加', range: '>300 mg/g' },
]

const randomItem = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]

const getRandomCaseId = () => randomItem(stage2Cases).id

const riskMatrix: Record<string, Record<string, RiskLevel>> = {
  G1: { A1: 'low', A2: 'moderate', A3: 'high' },
  G2: { A1: 'low', A2: 'moderate', A3: 'high' },
  G3a: { A1: 'moderate', A2: 'high', A3: 'extreme' },
  G3b: { A1: 'high', A2: 'extreme', A3: 'extreme' },
  G4: { A1: 'high', A2: 'extreme', A3: 'extreme' },
  G5: { A1: 'extreme', A2: 'extreme', A3: 'extreme' },
}

const riskStyles: Record<
  RiskLevel,
  {
    label: string
    cell: string
    badge: string
    summary: string
  }
> = {
  low: {
    label: '低度風險',
    cell: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    summary: '每年定期追蹤',
  },
  moderate: {
    label: '中度風險',
    cell: 'bg-amber-50 border-amber-100 text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
    summary: '治療+檢測 每年檢測',
  },
  high: {
    label: '高度風險',
    cell: 'bg-orange-50 border-orange-100 text-orange-600',
    badge: 'bg-orange-100 text-orange-700',
    summary: '治療+檢測 每年至少2次',
  },
  extreme: {
    label: '極高風險',
    cell: 'bg-rose-50 border-rose-200 text-rose-700',
    badge: 'bg-rose-100 text-rose-700',
    summary: '治療+檢測 每年至少3次',
  },
}

const imagingExams = [
  {
    id: 'xray',
    title: '腹部 X 光',
    subtitle: '排除結石或骨頭異常',
    description: '快速檢查腎結石、鈣化與脊椎排列，檢查時間短又普及。',
    icon: '🩻',
    color: 'from-lime-100 to-white',
    imageSrc: '/images/img3.png',
  },
  {
    id: 'ultrasound',
    title: '腎臟超音波',
    subtitle: '評估腎臟形狀與結構',
    description: '可即時觀察腎臟大小、囊腫、結石與積水，是腎臟病追蹤的基本檢查。',
    icon: '🔊',
    color: 'from-cyan-100 to-white',
    imageSrc: '/images/img4.png',
  },
  {
    id: 'biopsy',
    title: '腎臟切片',
    subtitle: '瞭解病理與嚴重度',
    description: '透過細針取出腎臟組織，在顯微鏡下判讀疾病類型與嚴重度。',
    icon: '🧬',
    color: 'from-violet-100 to-white',
    imageSrc: '/images/img5.png',
  },
]

const quizData = {
  question: '阿德的 eGFR 是 38 ml/min/1.73m²，尿蛋白 250 mg/g，他的腎病風險屬於哪一級？',
  options: [
    { label: '低度風險', value: 'low' },
    { label: '中度風險', value: 'moderate' },
    { label: '高度風險', value: 'high' },
    { label: '極高風險', value: 'extreme' },
  ],
  answer: 'extreme',
}

type CaseLab = {
  id: LabRow['id']
  value: string
  status: 'normal' | 'high' | 'low' | 'attention'
}

type Stage2Case = {
  id: string
  title: string
  story: string
  gfrId: string
  albuminId: string
  labs: CaseLab[]
  note: string
}

const stage2Cases: Stage2Case[] = [
  {
    id: 'case-a',
    title: '案例 A：健康追蹤',
    story: '小豪定期健檢，想知道自己的腎臟風險是否需要擔心。',
    gfrId: 'G1',
    albuminId: 'A1',
    labs: [
      { id: 'gfr', value: '≥90', status: 'normal' },
      { id: 'uacr', value: '<30 mg/g', status: 'normal' },
      { id: 'cr', value: '0.9 mg/dl', status: 'normal' },
    ],
    note: '數值落在安全範圍仍要定期追蹤，別等到症狀出現才開始檢查。',
  },
  {
    id: 'case-b',
    title: '案例 B：泡泡尿',
    story: '小安最近常看到尿液起泡泡，但身體其他狀況還好。',
    gfrId: 'G1',
    albuminId: 'A2',
    labs: [
      { id: 'gfr', value: '≥90', status: 'normal' },
      { id: 'uacr', value: '80 mg/g', status: 'attention' },
      { id: 'upcr', value: '180 mg/dl', status: 'attention' },
    ],
    note: '重點不是 eGFR，而是尿蛋白。早期就能靠驗尿抓到腎臟受損跡象。',
  },
  {
    id: 'case-c',
    title: '案例 C：eGFR 下降',
    story: '阿哲抽血後發現 eGFR 只有 52，但驗尿尿蛋白沒超標。',
    gfrId: 'G3a',
    albuminId: 'A1',
    labs: [
      { id: 'gfr', value: '45-59', status: 'attention' },
      { id: 'uacr', value: '<30 mg/g', status: 'normal' },
      { id: 'cr', value: '1.4 mg/dl', status: 'high' },
    ],
    note: '即使尿蛋白正常，eGFR 下降仍代表腎功能已變差，需要規律追蹤。',
  },
  {
    id: 'case-d',
    title: '案例 D：糖尿病控制不佳',
    story: '阿慧 HbA1c 偏高，最近也開始出現微量蛋白尿。',
    gfrId: 'G3a',
    albuminId: 'A2',
    labs: [
      { id: 'hba1c', value: '8.2%', status: 'high' },
      { id: 'uacr', value: '120 mg/g', status: 'attention' },
      { id: 'gfr', value: '45-59', status: 'attention' },
    ],
    note: '血糖與尿蛋白常常一起變糟；把三高控制好，是延緩腎損傷的關鍵。',
  },
  {
    id: 'case-e',
    title: '案例 E：高風險需要警覺',
    story: '阿德 eGFR 38、尿蛋白 250，最近也很容易疲倦。',
    gfrId: 'G3b',
    albuminId: 'A2',
    labs: [
      { id: 'gfr', value: '30-44', status: 'attention' },
      { id: 'uacr', value: '250 mg/g', status: 'high' },
      { id: 'cr', value: '2.0 mg/dl', status: 'high' },
      { id: 'hb', value: '10.2 g/dl', status: 'low' },
    ],
    note: 'eGFR + 尿蛋白一起看，風險會上升一個檔次；疲倦也可能與貧血相關。',
  },
]

export function Stage2() {
  const navigate = useNavigate()
  const [selectedGfr, setSelectedGfr] = useState(gfrStages[0].id)
  const [selectedAlbumin, setSelectedAlbumin] = useState(albuminStages[0].id)
  const [activeExam, setActiveExam] = useState(imagingExams[0].id)
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null)
  const [quizError, setQuizError] = useState<string | null>(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [selectedCaseId, setSelectedCaseId] = useState(stage2Cases[0].id)
  const [focusedLabId, setFocusedLabId] = useState<LabRow['id'] | null>(null)

  useEffect(() => {
    getStageUnlocked('stage2').then((unlocked) => {
      setIsUnlocked(unlocked)
    })
  }, [])

  const selectedGfrStage = useMemo(() => gfrStages.find((stage) => stage.id === selectedGfr)!, [selectedGfr])
  const selectedAlbuminStage = useMemo(
    () => albuminStages.find((stage) => stage.id === selectedAlbumin)!,
    [selectedAlbumin]
  )
  const currentExam = useMemo(() => imagingExams.find((exam) => exam.id === activeExam)!, [activeExam])
  const selectedCase = useMemo(() => stage2Cases.find((item) => item.id === selectedCaseId)!, [selectedCaseId])
  const focusedLab = useMemo(() => labRows.find((row) => row.id === focusedLabId) ?? null, [focusedLabId])

  const handleMatrixSelect = (gfrId: string, albuminId: string) => {
    setSelectedGfr(gfrId)
    setSelectedAlbumin(albuminId)
  }

  const riskLevel = riskMatrix[selectedGfr][selectedAlbumin]
  const riskInfo = riskStyles[riskLevel]
  const selectedCaseRiskInfo = riskStyles[riskMatrix[selectedCase.gfrId][selectedCase.albuminId]]

  const applyCaseToMatrix = () => {
    handleMatrixSelect(selectedCase.gfrId, selectedCase.albuminId)
  }

  const randomizeCase = () => {
    const next = getRandomCaseId()
    setSelectedCaseId(next)
    setFocusedLabId(null)
  }

  const handleArrowClick = () => {
    if (!isUnlocked) {
      setIsQuizOpen(true)
      return
    }
    navigate('/journey/stage3')
  }

  const handleSubmit = () => {
    if (!selectedQuizOption) {
      setQuizError('請先選擇答案')
      return
    }
    if (selectedQuizOption === quizData.answer) {
      setIsUnlocked(true)
      setIsQuizOpen(false)
      setQuizError(null)
      setSelectedQuizOption(null)
      setStageUnlocked('stage2', true)
    } else {
      setQuizError('答案不正確，再試一次。')
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-rose-50 via-orange-50 to-amber-50 py-16 px-4 text-slate-800 relative overflow-hidden">
      <Button
        variant="ghost"
        onClick={() => navigate('/journey/stage1')}
        className="fixed top-20 left-4 z-30 bg-white/70 backdrop-blur border border-white hover:bg-white shadow-sm"
      >
        ← 回到上一關
      </Button>
      <button
        aria-label={isUnlocked ? '前往第三關' : '解鎖下一關'}
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
          <p className="text-sm uppercase tracking-[0.4em] text-rose-500">Stage 02 / 功能檢讀所</p>
          <h1 className="text-3xl font-black text-rose-800">功能檢讀所：把檢查數字變成行動指南</h1>
          <p className="text-slate-600">
            腎臟病的每一張報告都是暗號。走進檢讀所，透過血檢、尿檢與影像，把指標轉換成可理解的行動指南。
          </p>
        </header>

        <section className="bg-white rounded-3xl shadow-lg p-8 border border-rose-100 space-y-6">
          <div className="grid gap-4 lg:grid-cols-[220px_1fr] items-start">
            <div className="rounded-2xl bg-linear-to-br from-rose-50 to-white border border-rose-100 p-5 text-sm text-rose-700 space-y-3">
              <p className="text-base font-semibold text-rose-800">檢查提醒</p>
              <ul className="list-disc list-inside space-y-1">
                <li>數值需依照年齡、性別、種族進行換算。</li>
                <li>出現異常請與腎臟科醫師討論，勿自行停藥或調整劑量。</li>
                <li>標示為紅色的項目為腎臟病友需特別注意的關鍵指標。</li>
              </ul>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-200 rounded-2xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 text-left">
                  <tr>
                    <th className="py-3 px-4 font-semibold">檢驗項目</th>
                    <th className="py-3 px-4 font-semibold w-48">正常數值範圍</th>
                    <th className="py-3 px-4 font-semibold">檢驗項目說明</th>
                  </tr>
                </thead>
                <tbody>
                  {labRows.map((row, idx) => (
                    <tr key={row.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className={`py-3 px-4 font-semibold ${row.highlight ? 'text-rose-600' : 'text-slate-800'}`}>
                        {row.label}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {row.range.split('\n').map((line, index) => (
                          <p key={index}>{line}</p>
                        ))}
                      </td>
                      <td className="py-3 px-4 text-slate-700 leading-relaxed">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">資料來源：台大醫院</p>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-lg p-8 border border-rose-100 space-y-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-slate-900">腎病風險盤</h2>
                <span className="text-sm text-slate-500">點選格子，找出 eGFR 與尿蛋白的組合</span>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[520px] space-y-2">
                  <div className="grid text-xs font-semibold text-slate-500" style={{ gridTemplateColumns: '140px repeat(3, minmax(120px,1fr))' }}>
                    <div className="p-2 rounded-xl bg-slate-50">eGFR (ml/min/1.73m²)</div>
                    {albuminStages.map((albumin) => (
                      <div key={albumin.id} className="p-2 rounded-xl bg-slate-50 text-center">
                        <p>{albumin.label}</p>
                        <p className="text-[11px] text-slate-400">{albumin.range}</p>
                      </div>
                    ))}
                  </div>
                  {gfrStages.map((gfr) => (
                    <div
                      key={gfr.id}
                      className="grid items-center text-sm"
                      style={{ gridTemplateColumns: '140px repeat(3, minmax(120px,1fr))' }}
                    >
                      <div className="p-3 rounded-2xl bg-slate-50">
                        <p className="font-semibold">{gfr.label}</p>
                        <p className="text-xs text-slate-500">{gfr.range}</p>
                      </div>
                      {albuminStages.map((albumin) => {
                        const level = riskMatrix[gfr.id][albumin.id]
                        const levelInfo = riskStyles[level]
                        const isActive = selectedGfr === gfr.id && selectedAlbumin === albumin.id
                        return (
                          <button
                            key={`${gfr.id}-${albumin.id}`}
                            onClick={() => handleMatrixSelect(gfr.id, albumin.id)}
                            className={`m-1 p-3 rounded-2xl border text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${levelInfo.cell} ${
                              isActive ? 'ring-2 ring-offset-2 ring-rose-400' : ''
                            }`}
                          >
                            <p className="font-semibold">{levelInfo.label}</p>
                            <p className="text-xs opacity-70">{levelInfo.summary}</p>
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-500">目前組合</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {selectedGfrStage.label} × {selectedAlbuminStage.label}
                  </p>
                  <p className="text-sm text-slate-600">
                    eGFR {selectedGfrStage.range}，尿蛋白 {selectedAlbuminStage.range}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${riskInfo.badge}`}>{riskInfo.label}</div>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-rose-50/80 p-4 text-sm text-rose-700">{riskInfo.summary}</div>
            </div>
            <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
              <div className="rounded-3xl border border-rose-100 bg-white/70 shadow-lg p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.4em] text-rose-500">情境模擬</p>
                    <h3 className="text-lg font-semibold text-slate-900">報告檢讀小幫手</h3>
                    <p className="text-xs text-slate-500">先選一個案例，再一鍵套用到風險盤。</p>
                  </div>
                  <Button variant="ghost" onClick={randomizeCase}>
                    隨機案例
                  </Button>
                </div>

                <div className="grid gap-2">
                  {stage2Cases.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedCaseId(item.id)
                        setFocusedLabId(null)
                      }}
                      className={`rounded-2xl border px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                        selectedCaseId === item.id
                          ? 'border-rose-300 bg-rose-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-rose-200'
                      }`}
                    >
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.story}</p>
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">本案例重點</p>
                    <Button onClick={applyCaseToMatrix} className="bg-rose-500 hover:bg-rose-600 text-white px-4">
                      套用到風險盤
                    </Button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">對應風險</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedCaseRiskInfo.badge}`}>
                      {selectedCaseRiskInfo.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCase.labs.map((lab) => {
                      const palette =
                        lab.status === 'high'
                          ? 'bg-rose-100 text-rose-700 border-rose-200'
                          : lab.status === 'low'
                            ? 'bg-sky-100 text-sky-700 border-sky-200'
                            : lab.status === 'attention'
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                      const label = labRows.find((row) => row.id === lab.id)?.label ?? lab.id
                      return (
                        <button
                          key={`${selectedCase.id}-${lab.id}`}
                          onClick={() => setFocusedLabId(lab.id)}
                          className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors hover:opacity-90 hover:-translate-y-px ${palette}`}
                        >
                          {label}：{lab.value}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedCase.note}</p>
                </div>

                {focusedLab && (
                  <div className="rounded-2xl border border-rose-100 bg-white p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-slate-900">{focusedLab.label}</p>
                      <button
                        className="text-xs text-slate-500 hover:text-slate-700"
                        onClick={() => setFocusedLabId(null)}
                      >
                        關閉
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">正常數值：{focusedLab.range}</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{focusedLab.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-lg p-8 border border-rose-100 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">常見腎臟影像檢查</h2>
              <p className="text-sm text-slate-500">點擊卡片即可查看示意圖。</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {imagingExams.map((exam) => {
              const isActive = activeExam === exam.id
              return (
                <button
                  key={exam.id}
                  onClick={() => setActiveExam(exam.id)}
                  className={`rounded-3xl border p-5 text-left transition-all flex flex-col gap-3 hover:-translate-y-1 ${
                    isActive
                      ? 'border-rose-400 bg-slate-900 text-white shadow-lg'
                      : 'border-slate-200 bg-linear-to-b from-white to-slate-50 hover:border-rose-200 hover:shadow-md'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl bg-linear-to-br ${exam.color} flex items-center justify-center text-2xl ${
                      isActive ? 'text-slate-900 bg-white' : ''
                    }`}
                  >
                    {exam.icon}
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{exam.title}</p>
                    <p className={`text-sm ${isActive ? 'text-white/80' : 'text-slate-500'}`}>{exam.subtitle}</p>
                  </div>
                  <p className={`text-sm leading-relaxed ${isActive ? 'text-white/90' : 'text-slate-600'}`}>{exam.description}</p>
                </button>
              )
            })}
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5 grid gap-4 lg:grid-cols-[1.2fr_1fr] items-center">
            <div className="rounded-2xl bg-white border border-slate-200 p-3">
              <img
                src={currentExam.imageSrc}
                alt={`${currentExam.title} 示意圖`}
                className="w-full max-h-80 object-contain"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">目前選擇</p>
              <p className="text-lg font-semibold text-slate-900">{currentExam.title}</p>
              <p className="text-sm text-slate-600">{currentExam.subtitle}</p>
              <p className="text-sm text-slate-600 leading-relaxed">{currentExam.description}</p>
            </div>
          </div>
        </section>
      </div>

      {isQuizOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-500">Stage 2 問題</p>
            <h3 className="text-xl font-semibold text-slate-900">{quizData.question}</h3>
            <div className="space-y-3">
              {quizData.options.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 rounded-2xl border p-3 cursor-pointer transition-colors ${
                    selectedQuizOption === option.value ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200 hover:border-rose-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="quiz2"
                    value={option.value}
                    className="sr-only"
                    checked={selectedQuizOption === option.value}
                    onChange={(e) => {
                      setSelectedQuizOption(e.target.value)
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
