import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { getQuestions, startQuizAttempt, recordAnswer, completeQuizAttempt, getAttemptHistory } from '../lib/api'
import { getStoredUser } from '../lib/storage'
import type { Question, QuizAttempt } from '../types'

type QuizState = 'selecting' | 'answering' | 'result'

export function QuizBankPage() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Quiz state
  const [quizState, setQuizState] = useState<QuizState>('selecting')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [userAnswers, setUserAnswers] = useState<number[][]>([])
  const [showFeedback, setShowFeedback] = useState(false)

  // Attempt tracking
  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [attemptHistory, setAttemptHistory] = useState<QuizAttempt[]>([])

  const currentUser = getStoredUser()

  useEffect(() => {
    loadQuestions()
    if (currentUser) {
      loadAttemptHistory()
    }
  }, [])

  const loadQuestions = async () => {
    setIsLoading(true)
    const result = await getQuestions()
    if (result.success && result.data) {
      setQuestions(result.data)
    } else {
      setError('載入題目失敗')
    }
    setIsLoading(false)
  }

  const loadAttemptHistory = async () => {
    if (!currentUser) return
    const result = await getAttemptHistory(currentUser.id, 5)
    if (result.success && result.data) {
      setAttemptHistory(result.data)
    }
  }

  const startQuiz = async () => {
    if (questions.length === 0) return
    
    // Start a new attempt if user is logged in
    if (currentUser) {
      const result = await startQuizAttempt(currentUser.id)
      if (result.success && result.data) {
        setAttemptId(result.data.attemptId)
      }
    }
    
    setQuizState('answering')
    setCurrentQuestionIndex(0)
    setSelectedAnswers([])
    setUserAnswers([])
    setShowFeedback(false)
  }

  const handleAnswerSelect = (index: number) => {
    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) return

    if (currentQuestion.questionType === 'single') {
      setSelectedAnswers([index])
    } else {
      if (selectedAnswers.includes(index)) {
        setSelectedAnswers(selectedAnswers.filter((i) => i !== index))
      } else {
        setSelectedAnswers([...selectedAnswers, index])
      }
    }
  }

  const handleSubmitAnswer = async () => {
    if (selectedAnswers.length === 0) return

    const currentQuestion = questions[currentQuestionIndex]
    const correct = checkCurrentAnswer()
    
    // Record answer to backend if logged in
    if (attemptId && currentQuestion) {
      await recordAnswer(attemptId, currentQuestion.id, selectedAnswers, correct)
    }

    const newUserAnswers = [...userAnswers, [...selectedAnswers]]
    setUserAnswers(newUserAnswers)
    setShowFeedback(true)
  }

  const checkCurrentAnswer = (): boolean => {
    const question = questions[currentQuestionIndex]
    if (!question) return false
    const sortedCorrect = [...question.correctAnswers].sort()
    const sortedUser = [...selectedAnswers].sort()
    return (
      sortedCorrect.length === sortedUser.length &&
      sortedCorrect.every((val, idx) => val === sortedUser[idx])
    )
  }

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswers([])
      setShowFeedback(false)
    } else {
      // Complete the attempt when finished
      if (attemptId) {
        await completeQuizAttempt(attemptId)
        loadAttemptHistory() // Refresh history
      }
      setQuizState('result')
    }
  }

  const isCorrect = (questionIndex: number): boolean => {
    const question = questions[questionIndex]
    const userAnswer = userAnswers[questionIndex]
    if (!question || !userAnswer) return false

    const sortedCorrect = [...question.correctAnswers].sort()
    const sortedUser = [...userAnswer].sort()
    return (
      sortedCorrect.length === sortedUser.length &&
      sortedCorrect.every((val, idx) => val === sortedUser[idx])
    )
  }

  const calculateScore = (): { correct: number; total: number } => {
    let correct = 0
    for (let i = 0; i < questions.length; i++) {
      if (isCorrect(i)) correct++
    }
    return { correct, total: questions.length }
  }

  const resetQuiz = () => {
    setQuizState('selecting')
    setCurrentQuestionIndex(0)
    setSelectedAnswers([])
    setUserAnswers([])
    setShowFeedback(false)
    setAttemptId(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-rose-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-300 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">載入題庫中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-rose-50 via-orange-50 to-amber-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.4em] text-rose-500">Quiz Bank / 題庫系統</p>
          <h1 className="text-3xl font-black text-rose-800">挑戰你的健康知識！</h1>
          <p className="text-slate-600">測驗由管理員建立的題目，檢視你對健康教育的理解程度。</p>
        </header>

        {/* User info */}
        {currentUser && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-4 py-2 bg-white/80 rounded-full text-sm text-slate-600 shadow-sm border border-rose-100">
              {currentUser.username}
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Selecting state - show start button */}
        {quizState === 'selecting' && (
          <>
            <div className="max-w-xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-rose-100 p-8 text-center">
              <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-rose-800 mb-2">準備好挑戰了嗎？</h2>
              <p className="text-slate-600 mb-2">題庫共有 <span className="font-semibold text-rose-600">{questions.length}</span> 題</p>
              {questions.length === 0 ? (
                <p className="text-amber-600 mb-6">目前題庫尚無題目，請等待管理員新增</p>
              ) : (
                <p className="text-slate-400 text-sm mb-6">包含單選與多選題型，答錯也沒關係，重點是學習！</p>
              )}
              <Button
                onClick={startQuiz}
                disabled={questions.length === 0}
                className="bg-rose-500 hover:bg-rose-600 text-white rounded-2xl px-8 py-3 shadow-lg shadow-rose-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                開始測驗
              </Button>
            </div>

            {/* Attempt History */}
            {currentUser && attemptHistory.length > 0 && (
              <div className="max-w-xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-rose-100 p-6">
                <h3 className="text-lg font-bold text-rose-800 mb-4">歷史記錄</h3>
                <div className="space-y-3">
                  {attemptHistory.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {attempt.correctCount} / {attempt.totalQuestions} 題正確
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(attempt.completedAt || '').toLocaleString('zh-TW')}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          attempt.scorePercentage >= 80
                            ? 'bg-emerald-100 text-emerald-700'
                            : attempt.scorePercentage >= 60
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {Math.round(attempt.scorePercentage)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Answering state - show current question */}
        {quizState === 'answering' && questions[currentQuestionIndex] && (
          <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-rose-100 overflow-hidden">
            {/* Progress bar */}
            <div className="h-2 bg-rose-100">
              <div
                className="h-full bg-linear-to-r from-rose-400 to-rose-500 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>

            <div className="p-6 md:p-8">
              {/* Question info */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-rose-500">
                  第 {currentQuestionIndex + 1} / {questions.length} 題
                </span>
                <span className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                  {questions[currentQuestionIndex].questionType === 'single' ? '單選題' : '多選題'}
                </span>
              </div>

              {/* Question text */}
              <h3 className="text-xl font-bold text-rose-800 mb-6">
                {questions[currentQuestionIndex].questionText}
              </h3>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {questions[currentQuestionIndex].options.map((option, index) => {
                  const isSelected = selectedAnswers.includes(index)
                  const isCorrectAnswer = questions[currentQuestionIndex].correctAnswers.includes(index)
                  
                  let optionClass = 'border-slate-200 hover:border-rose-200'
                  if (showFeedback) {
                    if (isCorrectAnswer) {
                      optionClass = 'border-emerald-400 bg-emerald-50 text-emerald-700'
                    } else if (isSelected && !isCorrectAnswer) {
                      optionClass = 'border-red-400 bg-red-50 text-red-700'
                    }
                  } else if (isSelected) {
                    optionClass = 'border-rose-400 bg-rose-50 text-rose-700'
                  }

                  const isSingleChoice = questions[currentQuestionIndex].questionType === 'single'

                  return (
                    <label
                      key={index}
                      className={`flex items-center gap-3 rounded-2xl border p-3 cursor-pointer transition-colors ${optionClass} ${
                        showFeedback ? 'pointer-events-none' : ''
                      }`}
                    >
                      <input
                        type={isSingleChoice ? 'radio' : 'checkbox'}
                        className={`h-4 w-4 rounded border-slate-300 ${
                          isSelected ? 'text-rose-500' : ''
                        } focus:ring-rose-400`}
                        checked={isSelected}
                        onChange={() => !showFeedback && handleAnswerSelect(index)}
                        disabled={showFeedback}
                      />
                      <span className="font-medium">{option}</span>
                      {showFeedback && isCorrectAnswer && (
                        <span className="ml-auto text-emerald-600 font-semibold">✓</span>
                      )}
                    </label>
                  )
                })}
              </div>

              {/* Feedback message */}
              {showFeedback && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm mb-6 ${
                    isCorrect(currentQuestionIndex)
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-rose-200 bg-rose-50 text-rose-700'
                  }`}
                >
                  {isCorrect(currentQuestionIndex) ? (
                    <p>答對了！</p>
                  ) : (
                    <p>答錯了，正確答案已標示</p>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-3">
                {!showFeedback ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswers.length === 0}
                    className="bg-rose-500 hover:bg-rose-600 text-white rounded-2xl px-6 py-3 shadow-lg shadow-rose-200 transition-all duration-200 disabled:opacity-50"
                  >
                    確認答案
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    className="bg-rose-500 hover:bg-rose-600 text-white rounded-2xl px-6 py-3 shadow-lg shadow-rose-200 transition-all duration-200"
                  >
                    {currentQuestionIndex < questions.length - 1 ? '下一題' : '查看結果'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Result state - show score */}
        {quizState === 'result' && (
          <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-rose-100 p-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-linear-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-12 h-12 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-rose-800 mb-2">測驗完成！</h2>
            </div>
            
            {(() => {
              const { correct, total } = calculateScore()
              const percentage = Math.round((correct / total) * 100)
              return (
                <>
                  <div className="my-6 text-center">
                    <p className="text-5xl font-black text-rose-500 mb-2">
                      {correct} / {total}
                    </p>
                    <p className="text-slate-600">正確率 {percentage}%</p>
                  </div>

                  <div className="text-center">
                    {percentage === 100 && (
                      <p className="text-emerald-600 font-semibold mb-6">太棒了，全部答對！你是健康知識達人！</p>
                    )}
                    {percentage >= 60 && percentage < 100 && (
                      <p className="text-amber-600 font-semibold mb-6">表現不錯，繼續加油！</p>
                    )}
                    {percentage < 60 && (
                      <p className="text-rose-600 font-semibold mb-6">再接再厲，多多練習就會進步！</p>
                    )}
                  </div>
                </>
              )
            })()}

            {/* Question review */}
            <div className="mt-8 mb-6">
              <h3 className="text-lg font-bold text-rose-800 mb-4">答題回顧</h3>
              <div className="space-y-3 text-left">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border ${
                      isCorrect(idx)
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          isCorrect(idx) ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                      >
                        {isCorrect(idx) ? '✓' : '✗'}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800 mb-1">
                          {idx + 1}. {q.questionText}
                        </p>
                        <p className="text-xs text-slate-500">
                          你的答案：{userAnswers[idx]?.map((i) => q.options[i]).join(', ') || '未作答'}
                        </p>
                        {!isCorrect(idx) && (
                          <p className="text-xs text-emerald-600 mt-1">
                            正確答案：{q.correctAnswers.map((i) => q.options[i]).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={resetQuiz}
                className="bg-rose-500 hover:bg-rose-600 text-white rounded-2xl px-6 py-3 shadow-lg shadow-rose-200 transition-all duration-200"
              >
                再測一次
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="rounded-2xl px-6 py-3 border-rose-200 hover:bg-rose-50 transition-all"
              >
                返回首頁
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
