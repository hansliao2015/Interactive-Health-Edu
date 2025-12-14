import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { getStageUnlocked, setStageUnlocked } from '../lib/journeyProgress'
import { resolveLockedRedirectPath } from '../lib/journeyGuard'
import { getStageState, setStageState } from '../lib/stageState'

const principles = [
  {
    title: '避免使用 NSAIDs',
    description: '避免長期或大量服用非類固醇消炎止痛藥 (NSAIDs)，如布洛芬，這可能對腎臟造成負擔。',
    icon: '💊',
  },
  {
    title: '勿自行購買藥物',
    description: '不要自行購買來路不明的成藥、中草藥或草藥，其成分可能對腎臟有害。',
    icon: '🌿',
  },
  {
    title: '諮詢醫師使用保健品',
    description: '在服用任何保健食品或高蛋白粉之前，請先與醫師討論，確保適合您的腎功能狀況。',
    icon: '📦',
  },
  {
    title: '告知顯影劑需求',
    description: '若檢查需注射顯影劑，務必預先告知醫護人員您的腎功能狀態，以便採取預防措施。',
    icon: '💉',
  },
  {
    title: '主動告知腎功能',
    description: '就醫時，應主動告知醫師自己的腎功能情形，以便醫師評估並開立最安全的處方。',
    icon: '👨‍⚕️',
  },
]

const harmfulSubstances = [
  { name: '中藥', position: 'top-[15%] left-[33%]', description: '部分中藥材可能含有馬兜鈴酸等腎毒性成分，未經醫師處方不應隨意服用。' },
  { name: '草藥', position: 'top-[24%] left-[68%]', description: '來路不明的草藥或偏方可能未經純化，含有重金屬或有害物質，增加腎臟負擔。' },
  { name: '止痛藥', position: 'top-[38%] left-[5%]', description: '長期或過量使用非類固醇消炎藥 (NSAIDs) 會減少腎臟血流量，導致腎功能受損。' },
  { name: '補品', position: 'top-[69%] left-[5%]', description: '市售補品成分複雜，若含有不明或高劑量的成分，可能對腎臟代謝造成壓力。' },
  { name: '保健品', position: 'top-[87%] left-[30%]', description: '即使是保健食品，也應在醫師或藥師指導下使用，避免與其他藥物產生交互作用或加重腎臟負擔。' },
  { name: '民間偏方', position: 'top-[89%] left-[65%]', description: '許多偏方未經科學驗證，可能含有毒性，切勿輕信嘗試，以免造成不可逆的腎損傷。' },
  { name: '高蛋白粉', position: 'top-[55%] left-[85%]', description: '過量攝取蛋白質會增加腎臟過濾的負擔，對於腎功能不全者尤其危險。' },
  { name: '廣告藥品', position: 'top-[53%] left-[50%]', description: '電視或網路廣告的藥品常誇大其詞，成分不明，不應作為正規治療選項。' },
]

const quizData = {
  question: '關於保護腎臟的用藥安全，下列何者是正確的？（可複選）',
  options: [
    { label: '可以隨意服用電視廣告上推薦的藥品', value: 'ads' },
    { label: '就醫時應主動告知醫師自己的腎功能狀況', value: 'inform' },
    { label: '保健食品很安全，不需要先問過醫生', value: 'supplements' },
    { label: '感到疼痛時，優先選擇非類固醇消炎止痛藥 (NSAIDs)', value: 'nsaids' },
    { label: '應避免使用來路不明的中草藥或民間偏方', value: 'herbs' },
  ],
  answers: ['inform', 'herbs'],
}

type Substance = {
  name: string;
  position: string;
  description: string;
}

export function Stage8() {
  const navigate = useNavigate()

  type Stage8State = {
    visitedSubstances: string[]
    selectedAnswers: string[]
  }

  const saved = getStageState<Stage8State>('stage8')
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(() => saved?.selectedAnswers ?? [])
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [quizState, setQuizState] = useState<'idle' | 'wrong' | 'correct'>('idle')
  const [quizError, setQuizError] = useState<string | null>(null)
  
  const [visitedSubstances, setVisitedSubstances] = useState<string[]>(() => saved?.visitedSubstances ?? [])
  const [substanceModalContent, setSubstanceModalContent] = useState<Substance | null>(null)

  const allBubblesPopped = visitedSubstances.length === harmfulSubstances.length;

  useEffect(() => {
    resolveLockedRedirectPath('stage8').then((path) => {
      if (path) navigate(path, { replace: true })
    })
  }, [navigate])

  useEffect(() => {
    getStageUnlocked('stage8').then(setIsUnlocked)
  }, [])

  useEffect(() => {
    setStageState<Stage8State>('stage8', { visitedSubstances, selectedAnswers })
  }, [visitedSubstances, selectedAnswers])

  const handleModalClose = () => {
    if (substanceModalContent && !visitedSubstances.includes(substanceModalContent.name)) {
      setVisitedSubstances((prev) => [...prev, substanceModalContent.name])
    }
    setSubstanceModalContent(null)
  }

  const handleArrowClick = () => {
    if (!isUnlocked) {
      if (!allBubblesPopped) {
        alert('請先點擊所有泡泡，完成本關卡的探索！')
      } else {
        setQuizState('idle')
        setIsQuizOpen(true)
      }
      return
    }
    navigate('/journey/stage9')
  }

  const handleSubmit = () => {
    if (selectedAnswers.length === 0) {
      setQuizError('請至少選擇一個答案！')
      return
    }
    const isCorrect =
      selectedAnswers.length === quizData.answers.length &&
      quizData.answers.every((ans) => selectedAnswers.includes(ans))
    if (isCorrect) {
      setQuizState('correct')
      setQuizError(null)
      setIsUnlocked(true)
      void setStageUnlocked('stage8', true)
    } else {
      setQuizState('wrong')
      setQuizError('答案不完全正確，請參考本關內容再試一次！')
    }
  }

  const toggleAnswer = (value: string) => {
    setSelectedAnswers((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    )
    setQuizError(null)
    setQuizState('idle')
  }

  const resetBubbles = () => {
    setVisitedSubstances([])
    setSubstanceModalContent(null)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-rose-50 via-orange-50 to-amber-50 py-16 px-4 text-slate-800 relative overflow-hidden">
      <Button
        variant="ghost"
        onClick={() => navigate('/journey/stage7')}
        className="fixed top-20 left-4 z-30 bg-white/70 backdrop-blur border border-white hover:bg-white shadow-sm animate-[fade-in_0.5s_ease-out]"
      >
        ← 回到上一關
      </Button>
      <button
        aria-label={isUnlocked ? '前往下一關' : '解鎖下一關'}
        onClick={handleArrowClick}
        className={`fixed top-1/2 right-4 -translate-y-1/2 z-30 flex flex-col items-center gap-2 rounded-3xl px-4 py-5 shadow-xl transition-all duration-200 animate-[fade-in_0.5s_ease-out] ${
          isUnlocked
            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
            : !allBubblesPopped
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-rose-500 text-white hover:bg-rose-600 animate-pulse'
        }`}
        disabled={!isUnlocked && !allBubblesPopped}
      >
        <span className="text-2xl">{isUnlocked ? '🔓' : '🔒'}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-7 h-7"
        >
          <path d="M13.172 12 8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
        </svg>
      </button>

      <div className="max-w-7xl mx-auto space-y-10 animate-[stagger-in_0.5s_ease-out]">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.4em] text-rose-500">Stage 08 / 藥品檢驗所</p>
          <h1 className="text-3xl font-black text-rose-800">護腎還是傷腎？</h1>
          <p className="text-slate-600">
            藥物是健康的雙面刃。點擊泡泡了解哪些藥物和習慣可能傷害腎臟，是保護自己的第一步。
          </p>
        </header>

        <section className="bg-white rounded-3xl shadow-lg p-8 border border-rose-100 grid md:grid-cols-[1fr_0.8fr] gap-12 items-start">
          <div className="relative w-full max-w-lg mx-auto aspect-square">
            <div className="absolute inset-0">
              <img 
                src="/images/img6.png" 
                alt="難過的腎" 
                className={`w-full h-full object-contain transition-opacity duration-1000 animate-float-slower ${allBubblesPopped ? 'opacity-0' : 'opacity-30'}`}
              />
               <img 
                src="/images/img7.png" 
                alt="開心的腎" 
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ${allBubblesPopped ? 'opacity-100' : 'opacity-0'}`}
              />
            </div>
            
            {harmfulSubstances.map((sub, i) => {
              const isVisited = visitedSubstances.includes(sub.name)
              return (
                <button
                  key={sub.name}
                  onClick={() => setSubstanceModalContent(sub)}
                  style={{ animationDelay: `${i * 100}ms` }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-24 h-24 rounded-full text-center font-semibold shadow-lg transition-all duration-500 z-10 animate-float-slow animate-stagger-in ${
                    sub.position
                  } ${
                    isVisited
                      ? 'opacity-0 scale-50 pointer-events-none'
                      : 'bg-rose-100/80 border-2 border-rose-300 text-rose-800 hover:scale-110 hover:bg-rose-200/80'
                  }`}
                >
                  {sub.name}
                </button>
              )
            })}
          </div>
           <div className="space-y-4">
              <div className="bg-white/70 backdrop-blur-sm border border-rose-200 rounded-2xl p-6 shadow-sm space-y-4">
                 <h2 className="text-xl font-bold text-rose-800">安全用藥五大原則</h2>
                 {principles.map((principle, idx) => (
                  <div
                    key={idx}
                    className="border-t border-rose-200/80 pt-4 first:border-t-0 first:pt-0"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl mt-1 text-rose-500">{principle.icon}</span>
                      <div>
                        <h3 className="font-bold text-slate-900">{principle.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {principle.description}
                        </p>
                      </div>
                    </div>
                  </div>
                 ))}
             </div>
              <Button
                variant="outline"
                onClick={resetBubbles}
                className="w-full bg-white/80 hover:bg-white"
              >
                重製泡泡
              </Button>
           </div>
         </section>

        {visitedSubstances.length > 0 && (
          <section className="bg-amber-50/70 backdrop-blur-sm border border-amber-200 rounded-3xl p-8 mt-12 animate-[stagger-in_0.5s_ease-out_forwards] opacity-0">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-amber-800 text-center mb-6">收集到的資訊</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visitedSubstances.map((name, idx) => {
                  const sub = harmfulSubstances.find(s => s.name === name)!
                  return (
                    <div 
                      key={name}
                      style={{ animationDelay: `${idx * 100}ms` }}
                      className="p-4 rounded-xl bg-white/80 border border-amber-200/80 shadow-sm animate-[stagger-in_0.5s_ease-out_forwards] opacity-0"
                    >
                      <p className="font-bold text-amber-900">{sub.name}</p>
                      <p className="text-sm text-amber-800 mt-1">{sub.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}
      </div>
      
      {substanceModalContent && (
        <div 
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-[fade-in_0.3s_ease-out]"
          onClick={handleModalClose}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full space-y-4 relative animate-[scale-in_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-rose-800 mt-2">{substanceModalContent.name}</h3>
            </div>
            <p className="text-slate-600 leading-relaxed text-center">{substanceModalContent.description}</p>
            <div className="text-right mt-4">
              <Button onClick={handleModalClose} className="w-full bg-rose-500 hover:bg-rose-600">
                關閉
              </Button>
            </div>
          </div>
        </div>
      )}

      {isQuizOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-40 px-4 animate-[fade-in_0.3s_ease-out]">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-lg w-full space-y-4 animate-[scale-in_0.3s_ease-out]">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-500">Stage 8 最終測驗</p>
            <h3 className="text-xl font-semibold text-slate-900">{quizData.question}</h3>
            {/* Quiz implementation remains the same */}
            <div className="space-y-3">
              {quizData.options.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 rounded-2xl border p-3 cursor-pointer transition-colors ${
                    selectedAnswers.includes(option.value)
                      ? 'border-rose-400 bg-rose-50 text-rose-800'
                      : 'border-slate-200 hover:border-rose-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-rose-500 focus:ring-rose-400"
                    checked={selectedAnswers.includes(option.value)}
                    onChange={() => toggleAnswer(option.value)}
                  />
                  <span className="font-medium">{option.label}</span>
                </label>
              ))}
            </div>
            {quizError && <p className="text-sm text-red-500">{quizError}</p>}
            {quizState === 'correct' && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                解鎖成功！你可以按「進入下一關」繼續闖關。
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setIsQuizOpen(false)}>
                關閉
              </Button>
              {quizState !== 'correct' && (
                <Button onClick={handleSubmit} className="bg-rose-500 hover:bg-rose-600 text-white px-6">
                  確認答案
                </Button>
              )}
              {quizState === 'correct' && (
                <Button
                  onClick={() => navigate('/journey/stage9')}
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
