import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'

export function Stage3() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 py-16 px-4 text-slate-800">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.4em] text-rose-500">Stage 03</p>
          <h1 className="text-3xl font-black text-rose-800">第三關內容尚未上架</h1>
          <p className="text-slate-600">
            目前先把路由補齊，避免第二關解鎖後跳到 404。你提供第三關素材後，我再依照同樣風格完成版面與互動。
          </p>
        </header>

        <div className="bg-white rounded-3xl shadow-lg p-8 border border-rose-100">
          <p className="text-sm text-slate-600 leading-relaxed">
            你可以先繼續調整第二關內容與轉盤呈現；等你把第三關的圖片與文字整理好（或丟投影片截圖），我就能快速接著做。
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => navigate('/journey/stage2')}>
            返回第二關
          </Button>
          <Button className="bg-rose-500 hover:bg-rose-600 text-white px-6" onClick={() => navigate('/journey')}>
            回到地圖
          </Button>
        </div>
      </div>
    </div>
  )
}
