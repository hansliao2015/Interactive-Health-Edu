import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import type { User } from '../types'

type AuthPageProps = {
  onLogin: (user: User) => void
  user: User | null
}

type Message = { type: 'success' | 'error'; text: string }

const extractUser = (payload: unknown): User | null => {
  if (!payload || typeof payload !== 'object') return null
  const candidate = payload as Record<string, unknown>
  if (candidate.user && typeof candidate.user === 'object') {
    return candidate.user as User
  }
  if ('id' in candidate && 'username' in candidate) {
    return candidate as unknown as User
  }
  if (candidate.data && typeof candidate.data === 'object') {
    const nested = candidate.data as Record<string, unknown>
    if (nested.user && typeof nested.user === 'object') {
      return nested.user as User
    }
    if ('id' in nested && 'username' in nested) {
      return nested as unknown as User
    }
  }
  return null
}

export function AuthPage({ onLogin, user }: AuthPageProps) {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [message, setMessage] = useState<Message | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      navigate('/journey', { replace: true })
    }
  }, [user, navigate])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const action = isLogin ? 'login' : 'register'
    const payload = isLogin ? { username: formData.username, password: formData.password } : formData

    try {
      const response = await fetch(`http://localhost:8000/api.php?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        if (isLogin) {
          const loggedInUser = extractUser(data)
          if (loggedInUser) {
            onLogin(loggedInUser)
            setFormData({ username: '', password: '' })
          } else {
            setMessage({ type: 'error', text: '登入成功但未收到用戶資料，請再試一次。' })
          }
        } else {
          setFormData({ username: '', password: '' })
          setTimeout(() => {
            setIsLogin(true)
            setMessage(null)
          }, 1500)
        }
      } else {
        setMessage({ type: 'error', text: data.message ?? '操作失敗，請稍後再試。' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '連接失敗，請檢查後端伺服器是否運行。' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-page bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isLogin ? '登入帳號' : '註冊帳號'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? '歡迎回到 Interactive Health Edu' : '加入 Interactive Health Edu'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button
              onClick={() => {
                setIsLogin(true)
                setMessage(null)
              }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                isLogin
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              登入
            </button>
            <button
              onClick={() => {
                setIsLogin(false)
                setMessage(null)
              }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                !isLogin
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              註冊
            </button>
          </div>

          {message && (
            <div className={`mb-4 p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                用戶名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="輸入用戶名"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密碼
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="輸入密碼"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '處理中...' : (isLogin ? '登入' : '註冊')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? (
              <p>
                還沒有帳號？{' '}
                <button
                  onClick={() => {
                    setIsLogin(false)
                    setMessage(null)
                  }}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  立即註冊
                </button>
              </p>
            ) : (
              <p>
                已經有帳號了？{' '}
                <button
                  onClick={() => {
                    setIsLogin(true)
                    setMessage(null)
                  }}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  返回登入
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
