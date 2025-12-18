import { useEffect, useState } from "react"
import { Link, Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom"
import { Button } from "./components/ui/button"
import { AuthPage } from "./pages/AuthPage"
import { NotFoundPage } from "./pages/NotFoundPage"
import { AdminPage } from "./pages/AdminPage"
import { QuizBankPage } from "./pages/QuizBankPage"
import { Stage0 } from "./pages/Stage0"
import { Stage1 } from "./pages/Stage1"
import { Stage2 } from "./pages/Stage2"
import { Stage3 } from "./pages/Stage3"
import { Stage4 } from "./pages/Stage4"
import { Stage5 } from "./pages/Stage5"
import { Stage6 } from "./pages/Stage6"
import { Stage7 } from "./pages/Stage7"
import { Stage8 } from "./pages/Stage8"
import { Stage9 } from "./pages/Stage9"
import { Stage10 } from "./pages/Stage10"
import { Stage11 } from "./pages/Stage11"
import { Stage12 } from "./pages/Stage12"
import { Stage13 } from "./pages/Stage13"
import { getStoredUser, setStoredUser } from "./lib/storage"
import type { User } from "./types"

function RequireAuth({ user }: { user: User | null }) {
  if (!user) {
    return <Navigate to="/auth" replace />
  }
  return <Outlet />
}

export function App() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser())

  useEffect(() => {
    setCurrentUser(getStoredUser())
  }, [])

  const handleLogin = (user: User) => {
    setStoredUser(user)
    setCurrentUser(user)
    navigate('/journey')
  }

  const handleLogout = () => {
    setStoredUser(null)
    setCurrentUser(null)
    navigate('/auth')
  }

  return (
    <div>
      <nav className="fixed top-0 left-0 h-16 w-full z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="shrink-0">
              <Link to="/journey" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Interactive Health Edu
              </Link>
            </div>

            <div className="flex items-center gap-6">
              {currentUser && (
                <div className="flex space-x-8">
                  <Link 
                    to="/quiz" 
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors relative group"
                  >
                    題庫系統
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                  </Link>
                  <Link 
                    to="/journey" 
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors relative group"
                  >
                    腎臟冒險
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                  </Link>
                </div>
              )}

              <div className="flex items-center gap-3">
                {currentUser ? (
                  <>
                    <span className="hidden sm:inline text-sm text-gray-600">嗨，{currentUser.username}</span>
                    <Button
                      variant="outline"
                      className="text-sm"
                      onClick={handleLogout}
                    >
                      登出
                    </Button>
                  </>
                ) : (
                  <Button
                    asChild
                    variant="outline"
                    className="text-sm"
                  >
                    <Link to="/auth">登入 / 註冊</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div className="mt-16">
        <Routes>
          <Route path="/auth" element={<AuthPage onLogin={handleLogin} user={currentUser} />} />

          <Route element={<RequireAuth user={currentUser} />}>
            <Route path="/" element={<Navigate to="/journey" replace />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="quiz" element={<QuizBankPage />} />
            <Route path="journey" element={<Stage0 onLogout={handleLogout} />} />
            <Route path="journey/stage1" element={<Stage1 />} />
            <Route path="journey/stage2" element={<Stage2 />} />
            <Route path="journey/stage3" element={<Stage3 />} />
            <Route path="journey/stage4" element={<Stage4 />} />
            <Route path="journey/stage5" element={<Stage5 />} />
            <Route path="journey/stage6" element={<Stage6 />} />
            <Route path="journey/stage7" element={<Stage7 />} />
            <Route path="journey/stage8" element={<Stage8 />} />
            <Route path="journey/stage9" element={<Stage9 />} />
            <Route path="journey/stage10" element={<Stage10 />} />
            <Route path="journey/stage11" element={<Stage11 />} />
            <Route path="journey/stage12" element={<Stage12 />} />
            <Route path="journey/stage13" element={<Stage13 />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="*" element={<Navigate to={currentUser ? '/journey' : '/auth'} replace />} />
        </Routes>
      </div>
    </div>
  )
}
