import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'

export function NotFoundPage() {
  return (
    <div className="min-h-page bg-linear-to-br from-rose-50 via-orange-50 to-amber-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-black text-rose-300 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-rose-800 mb-2">找不到頁面</h2>
        <p className="text-slate-600 mb-6">您要找的頁面不存在或已被移除</p>
        <Link to="/">
          <Button className="bg-rose-500 hover:bg-rose-600 text-white rounded-2xl px-6 py-3">
            返回首頁
          </Button>
        </Link>
      </div>
    </div>
  )
}