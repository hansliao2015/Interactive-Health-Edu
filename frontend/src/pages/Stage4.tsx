import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'

export function Stage4() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 py-16 px-4 text-slate-800 relative overflow-hidden">
      <Button
        variant="ghost"
        onClick={() => navigate('/journey/stage3')}
        className="fixed top-20 left-4 z-30 bg-white/70 backdrop-blur border border-white hover:bg-white shadow-sm"
      >
        ← 回到上一關
      </Button>

      <div className="max-w-4xl mx-auto">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.4em] text-sky-600">Stage 04</p>
          <h1 className="text-3xl font-black text-slate-900">下一關準備中</h1>
          <p className="text-slate-600">你已成功從 Stage3 進入這裡；等你提供第四關素材後，我可以接著把內容與解鎖題目做完整。</p>
        </header>

        <section className="mt-8 bg-white rounded-3xl shadow-lg p-8 border border-slate-100 space-y-4">
          <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100 text-sm text-slate-700 leading-relaxed">
            目前這頁是佔位頁（Placeholder）。如果你希望保留「右側鎖頭箭頭 → 題目 → 解鎖」的流程，也可以把 Stage4 的題目與互動形式一併設計。
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('/journey/stage3')}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              回到 Stage3
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/journey')}
              className="hover:bg-slate-50"
            >
              回到闖關地圖
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}

