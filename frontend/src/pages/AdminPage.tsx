import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { adminGetAllUsersProgress, getQuestions, createQuestion, deleteQuestion } from '../lib/api'
import { getStoredUser } from '../lib/storage'
import type { UserWithProgress, StageKey, Question, QuestionType } from '../types'

const STAGE_LABELS: Record<StageKey, string> = {
  stage1: '第一關',
  stage2: '第二關',
  stage3: '第三關',
  stage4: '第四關',
  stage5: '第五關',
  stage6: '第六關',
  stage7: '第七關',
  stage8: '第八關',
  stage9: '第九關',
  stage10: '第十關',
  stage11: '第十一關',
  stage12: '第十二關',
  stage13: '第十三關',
}

const STAGES: StageKey[] = [
  'stage1',
  'stage2',
  'stage3',
  'stage4',
  'stage5',
  'stage6',
  'stage7',
  'stage8',
  'stage9',
  'stage10',
  'stage11',
  'stage12',
  'stage13',
]

type Tab = 'users' | 'questions'

export function AdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('users')
  const [users, setUsers] = useState<UserWithProgress[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formStage, setFormStage] = useState<string>('stage1')
  const [formType, setFormType] = useState<QuestionType>('single')
  const [formQuestionText, setFormQuestionText] = useState('')
  const [formOptions, setFormOptions] = useState<string[]>(['', ''])
  const [formCorrectAnswers, setFormCorrectAnswers] = useState<number[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentUser = getStoredUser()

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/')
      return
    }
    loadData()
  }, [navigate])

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isFormOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isFormOpen])

  const loadData = async () => {
    setIsLoading(true)
    const [usersResult, questionsResult] = await Promise.all([
      adminGetAllUsersProgress(),
      getQuestions(),
    ])

    if (usersResult.success && usersResult.data) {
      setUsers(usersResult.data)
    }
    if (questionsResult.success && questionsResult.data) {
      setQuestions(questionsResult.data)
    }
    if (!usersResult.success && !questionsResult.success) {
      setError('載入資料失敗')
    }
    setIsLoading(false)
  }

  const handleAddOption = () => {
    setFormOptions([...formOptions, ''])
  }

  const handleRemoveOption = (index: number) => {
    if (formOptions.length <= 2) return
    const newOptions = formOptions.filter((_, i) => i !== index)
    const newCorrect = formCorrectAnswers
      .filter((i) => i !== index)
      .map((i) => (i > index ? i - 1 : i))
    setFormOptions(newOptions)
    setFormCorrectAnswers(newCorrect)
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formOptions]
    newOptions[index] = value
    setFormOptions(newOptions)
  }

  const handleCorrectToggle = (index: number) => {
    if (formType === 'single') {
      setFormCorrectAnswers([index])
    } else {
      if (formCorrectAnswers.includes(index)) {
        setFormCorrectAnswers(formCorrectAnswers.filter((i) => i !== index))
      } else {
        setFormCorrectAnswers([...formCorrectAnswers, index])
      }
    }
  }

  const resetForm = () => {
    setFormStage('stage1')
    setFormType('single')
    setFormQuestionText('')
    setFormOptions(['', ''])
    setFormCorrectAnswers([])
    setFormError(null)
  }

  const handleSubmit = async () => {
    if (!formQuestionText.trim()) {
      setFormError('請輸入題目')
      return
    }
    if (formOptions.some((opt) => !opt.trim())) {
      setFormError('所有選項都必須填寫')
      return
    }
    if (formCorrectAnswers.length === 0) {
      setFormError('請選擇正確答案')
      return
    }
    if (!currentUser) return

    setIsSubmitting(true)
    setFormError(null)

    const result = await createQuestion(
      formStage,
      formType,
      formQuestionText.trim(),
      formOptions.map((opt) => opt.trim()),
      formCorrectAnswers,
      currentUser.id
    )

    if (result.success) {
      setIsFormOpen(false)
      resetForm()
      loadData()
    } else {
      setFormError(result.message)
    }
    setIsSubmitting(false)
  }

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('確定要刪除這個題目嗎？')) return
    const result = await deleteQuestion(id)
    if (result.success) {
      loadData()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-page bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">載入中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-page bg-slate-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-page bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900">管理員後台</h1>
          <Button variant="outline" onClick={() => navigate('/')}>
            返回首頁
          </Button>
        </div>

        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
              activeTab === 'users'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-200'
                : 'bg-white/80 text-slate-600 hover:bg-white hover:shadow-md border border-rose-100'
            }`}
          >
            使用者進度
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
              activeTab === 'questions'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-200'
                : 'bg-white/80 text-slate-600 hover:bg-white hover:shadow-md border border-rose-100'
            }`}
          >
            題庫管理
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-rose-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-rose-100 bg-white/50">
              <h2 className="text-lg font-semibold text-slate-800">使用者進度總覽</h2>
              <p className="text-sm text-rose-400 mt-1">共 {users.length} 位使用者</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-rose-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-rose-500 uppercase tracking-wider">
                      使用者
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-rose-500 uppercase tracking-wider">
                      註冊時間
                    </th>
                    {STAGES.map((stage) => (
                      <th
                        key={stage}
                        className="px-6 py-3 text-center text-xs font-medium text-rose-500 uppercase tracking-wider"
                      >
                        {STAGE_LABELS[stage]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={2 + STAGES.length} className="px-6 py-8 text-center text-slate-500">
                        尚無使用者資料
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-rose-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">{user.username}</div>
                          <div className="text-xs text-slate-500">ID: {user.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(user.createdAt).toLocaleDateString('zh-TW')}
                        </td>
                        {STAGES.map((stage) => {
                          const progress = user.progress[stage]
                          const completed = progress?.completed ?? false
                          return (
                            <td key={stage} className="px-6 py-4 text-center">
                              {completed ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  ✓
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-400">
                                  −
                                </span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  resetForm()
                  setIsFormOpen(true)
                }}
                className="bg-rose-500 hover:bg-rose-600 text-white rounded-2xl px-6 py-3 shadow-lg shadow-rose-200 transition-all duration-200"
              >
                + 新增題目
              </Button>
            </div>

            {isFormOpen && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="px-6 py-5 border-b border-rose-100 bg-rose-50/50 rounded-t-3xl">
                    <p className="text-xs uppercase tracking-[0.2em] text-rose-400 mb-1">Question Form</p>
                    <h3 className="text-lg font-semibold text-slate-800">新增題目</h3>
                  </div>
                  <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">關卡</label>
                      <select
                        value={formStage}
                        onChange={(e) => setFormStage(e.target.value)}
                        className="w-full px-4 py-3 border border-rose-200 rounded-2xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300 bg-white/80 transition-all"
                      >
                        {STAGES.map((stage) => (
                          <option key={stage} value={stage}>
                            {STAGE_LABELS[stage]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">題型</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-3 cursor-pointer px-4 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 transition-colors">
                          <input
                            type="radio"
                            name="questionType"
                            checked={formType === 'single'}
                            onChange={() => {
                              setFormType('single')
                              setFormCorrectAnswers(formCorrectAnswers.slice(0, 1))
                            }}
                            className="accent-rose-500"
                          />
                          <span className="text-sm text-slate-700">單選題</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer px-4 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 transition-colors">
                          <input
                            type="radio"
                            name="questionType"
                            checked={formType === 'multiple'}
                            onChange={() => setFormType('multiple')}
                            className="accent-rose-500"
                          />
                          <span className="text-sm text-slate-700">多選題</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">題目敘述</label>
                      <textarea
                        value={formQuestionText}
                        onChange={(e) => setFormQuestionText(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-rose-200 rounded-2xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300 bg-white/80 transition-all"
                        placeholder="請輸入題目內容..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        選項 <span className="text-rose-400 font-normal">（點擊勾選正確答案）</span>
                      </label>
                      <div className="space-y-3">
                        {formOptions.map((option, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleCorrectToggle(index)}
                              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                formCorrectAnswers.includes(index)
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200'
                                  : 'border-rose-200 hover:border-emerald-400 hover:bg-emerald-50'
                              }`}
                            >
                              {formCorrectAnswers.includes(index) && '✓'}
                            </button>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              className="flex-1 px-4 py-3 border border-rose-200 rounded-2xl focus:ring-2 focus:ring-rose-300 focus:border-rose-300 bg-white/80 transition-all"
                              placeholder={`選項 ${index + 1}`}
                            />
                            {formOptions.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(index)}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="mt-3 text-sm text-rose-500 hover:text-rose-600 font-medium transition-colors"
                      >
                        + 新增選項
                      </button>
                    </div>

                    {formError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600">
                        {formError}
                      </div>
                    )}
                  </div>
                  <div className="px-6 py-5 border-t border-rose-100 bg-rose-50/30 flex justify-end gap-3 rounded-b-3xl">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsFormOpen(false)
                        resetForm()
                      }}
                      className="rounded-2xl px-5 py-2 border-rose-200 hover:bg-rose-50 transition-all"
                    >
                      取消
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-rose-500 hover:bg-rose-600 text-white rounded-2xl px-5 py-2 shadow-lg shadow-rose-200 transition-all duration-200"
                    >
                      {isSubmitting ? '儲存中...' : '儲存題目'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-rose-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-rose-100 bg-white/50">
                <h2 className="text-lg font-semibold text-slate-800">題庫列表</h2>
                <p className="text-sm text-rose-400 mt-1">共 {questions.length} 題</p>
              </div>
              <div className="divide-y divide-rose-100">
                {questions.length === 0 ? (
                  <div className="px-6 py-12 text-center text-slate-500">尚無題目，點擊上方按鈕新增</div>
                ) : (
                  questions.map((q) => (
                    <div key={q.id} className="px-6 py-5 hover:bg-rose-50/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 text-xs font-medium bg-rose-100 text-rose-600 rounded-full">
                              {STAGE_LABELS[q.stage as StageKey] || q.stage}
                            </span>
                            <span className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-600 rounded-full">
                              {q.questionType === 'single' ? '單選' : '多選'}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-900 mb-2">{q.questionText}</p>
                          <div className="flex flex-wrap gap-2">
                            {q.options.map((opt, i) => (
                              <span
                                key={i}
                                className={`px-3 py-1.5 text-xs rounded-full ${
                                  q.correctAnswers.includes(i)
                                    ? 'bg-emerald-100 text-emerald-700 font-medium'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {q.correctAnswers.includes(i) && '✓ '}
                                {opt}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          title="刪除題目"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
