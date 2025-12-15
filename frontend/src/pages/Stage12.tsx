import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { getStageUnlocked, setStageUnlocked } from '../lib/journeyProgress'
import { resolveLockedRedirectPath } from '../lib/journeyGuard'

export function Stage12() {
  const navigate = useNavigate()
  const stageId = 'stage12'
  const prevPath = '/journey/stage11'
  const nextPath = '/journey/stage13'

  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [quizState, setQuizState] = useState<'idle' | 'wrong' | 'correct'>('idle')
  const [quizError, setQuizError] = useState<string | null>(null)

  useEffect(() => {
    resolveLockedRedirectPath(stageId).then((path) => {
      if (path) navigate(path, { replace: true })
    })
  }, [navigate])

  useEffect(() => {
    getStageUnlocked(stageId).then(setIsUnlocked)
  }, [])

  const handleArrowClick = () => {
    if (isUnlocked) {
      navigate(nextPath)
      return
    }
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
          <p className="text-sm uppercase tracking-[0.4em] text-rose-500">Stage 12 / 關卡預留</p>
          <h1 className="text-3xl font-black text-rose-800">本關內容建置中</h1>
          <p className="text-slate-600">後續會補上互動教材，現在可以先完成解鎖測驗，持續前進下一關。</p>
        </header>

        <section className="bg-white rounded-3xl shadow-lg p-8 border border-rose-100 space-y-6">
          <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/70 px-4 py-10 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-rose-500">Placeholder</p>
            <p className="text-xl font-bold text-rose-800 mt-2">這裡將放置第 12 關的教材</p>
            <p className="text-sm text-slate-600 mt-2">之後會補上圖片、互動、解鎖任務。</p>
          </div>
          <div className="text-right">
            <Button onClick={handleArrowClick} className="bg-rose-500 hover:bg-rose-600 text-white px-6 cursor-pointer">
              開始測驗 / 解鎖
            </Button>
          </div>
        </section>
      </div>

      {isQuizOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-40 px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-500">Stage 12 問題</p>
            <h3 className="text-xl font-semibold text-slate-900">解鎖下一關</h3>
            <p className="text-sm text-slate-600 leading-relaxed">暫用題目：完成本關後按「確認答案」即可解鎖。</p>
            <div className="grid gap-2">
              {[
                { id: 'a', label: '我已閱讀本關佈景，準備繼續' },
                { id: 'b', label: '再等等，還沒準備好' },
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
                    name="stage12-quiz"
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
