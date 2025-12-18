import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { adminGetAllUsersProgress } from '../lib/api'
import { getStoredUser } from '../lib/storage'
import type { UserWithProgress, StageKey } from '../types'

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

const STAGES: StageKey[] = ['stage1', 'stage2', 'stage3', 'stage4', 'stage5', 'stage6', 'stage7', 'stage8', 'stage9', 'stage10', 'stage11', 'stage12', 'stage13']

export function AdminPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserWithProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const user = getStoredUser()
    if (!user || user.role !== 'admin') {
      navigate('/')
      return
    }

    adminGetAllUsersProgress().then((result) => {
      if (result.success && result.data) {
        setUsers(result.data)
      } else {
        setError(result.message)
      }
      setIsLoading(false)
    })
  }, [navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">載入中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900">管理員後台</h1>
          <Button variant="outline" onClick={() => navigate('/')}>
            返回首頁
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">所有使用者進度</h2>
            <p className="text-sm text-slate-500 mt-1">共 {users.length} 位使用者</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    使用者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    註冊時間
                  </th>
                  {STAGES.map((stage) => (
                    <th
                      key={stage}
                      className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider"
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
                    <tr key={user.id} className="hover:bg-slate-50">
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
                                ✓ 完成
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                                未完成
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
      </div>
    </div>
  )
}
