import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import type { User } from '../types'

type HomePageProps = {
  user: User | null
  onLogout: () => void
}

export function HomePage({ user, onLogout }: HomePageProps) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true })
    }
  }, [user, navigate])

  if (!user) {
    return null
  }

  const isAdmin = user.role === 'admin'

  return (
    <div className="min-h-page bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
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
            {isAdmin && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                管理員
              </span>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {isAdmin ? '您可以查看所有使用者的闖關進度。' : '闖關進度會同步記錄在這裡，隨時都能繼續挑戰。'}
            </p>
            <div className="mt-8 space-y-3">
              <Button 
                onClick={onLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                登出
              </Button>
              {isAdmin ? (
                <Button 
                  asChild
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Link to="/admin">進入管理後台</Link>
                </Button>
              ) : (
                <>
                  <Button 
                    asChild
                    className="w-full bg-linear-to-r from-rose-500 via-pink-500 to-orange-400 hover:opacity-90 text-white text-base shadow-lg"
                  >
                    <Link to="/journey">開始腎臟闖關</Link>
                  </Button>
                  <Button 
                    asChild
                    variant="outline"
                    className="w-full"
                  >
                    <Link to="/quiz">練習題庫</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
