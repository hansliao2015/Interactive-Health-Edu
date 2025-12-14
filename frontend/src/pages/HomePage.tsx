import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'

export function HomePage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<{ username: string } | null>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem('user')
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const action = isLogin ? 'login' : 'register'
    const payload = isLogin 
      ? { username: formData.username, password: formData.password }
      : formData

    try {
      const response = await fetch(`http://localhost:8000/api.php?action=${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        if (isLogin && data.user) {
          // 登入成功，設置用戶資訊並保存到 localStorage
          setUser(data.user)
          localStorage.setItem('user', JSON.stringify(data.user))
          setFormData({ username: '', password: '' })
        } else if (!isLogin) {
          // 註冊成功，跳轉到登入介面
          setFormData({ username: '', password: '' })
          setTimeout(() => {
            setIsLogin(true)
            setMessage(null)
          }, 1500)
        }
      } else {
        setMessage({ type: 'error', text: data.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '連接失敗，請檢查後端伺服器是否運行' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setMessage(null)
    localStorage.removeItem('user')
  }

  if (user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">歡迎回來！</h2>
              <p className="text-gray-600">用戶名：{user.username}</p>
              <p className="text-sm text-gray-500 mt-2">闖關進度會同步記錄在這裡，隨時都能繼續挑戰。</p>
              <div className="mt-8 space-y-3">
                <Button 
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  登出
                </Button>
                <Button 
                  asChild
                  className="w-full bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 hover:opacity-90 text-white text-base shadow-lg"
                >
                  <Link to="/journey">開始腎臟闖關</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isLogin ? '登入帳號' : '註冊帳號'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? '歡迎回到 Interactive Health Edu' : '加入 Interactive Health Edu'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Tab Switcher */}
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

          {/* Message Display */}
          {message && (
            <div className={`mb-4 p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
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

            {/* Password */}
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

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '處理中...' : (isLogin ? '登入' : '註冊')}
            </Button>
          </form>

          {/* Footer */}
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

        <div className="mt-10 relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-100 via-rose-100 to-amber-100 p-8 shadow-2xl border border-rose-200/70">
          <div className="absolute -right-10 -top-10 size-32 bg-white/30 rounded-full blur-3xl"></div>
          <div className="absolute -left-6 bottom-0 size-24 bg-amber-200/50 rounded-full blur-2xl"></div>
          <div className="relative">
            <p className="text-sm font-semibold tracking-widest uppercase text-rose-500 mb-2">腎臟冒險入口</p>
            <h3 className="text-2xl font-black text-rose-700">與腎同行的冒險之旅</h3>
            <p className="mt-4 text-rose-800/80">
              13 個關卡帶你認識腎臟保健、飲食與治療選擇。即使還在註冊，也能提前探索闖關地圖，為健康先備課。
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Button
                asChild
                className="bg-white/90 text-rose-600 hover:bg-white shadow-lg px-6 py-5 text-base"
              >
                <Link to="/journey">開始闖關</Link>
              </Button>
              <div className="px-4 py-3 rounded-2xl bg-rose-200/60 text-rose-700 text-sm font-medium backdrop-blur">
                π = 3.14159 腎臟照護密碼
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
