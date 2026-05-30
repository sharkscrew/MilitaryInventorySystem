import { useEffect, useState } from 'react'
import AxiosInstance from '../services/AxiosInstance'

const BAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
]

const DashboardPage = () => {
  const [lowStockItems, setLowStockItems] = useState([])
  const [stockByCategory, setStockByCategory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    AxiosInstance.get('/dashboard')
      .then((res) => {
        setLowStockItems(res.data.low_stock_items)
        setStockByCategory(res.data.stock_by_category)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const maxQty = Math.max(...stockByCategory.map((c: any) => c.quantity ?? 0), 1)

  if (loading) return <div className="text-white/40 text-sm py-24 text-center">Loading...</div>
  if (error) return <div className="text-red-400 text-sm px-4 mt-6">{error}</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-white/40 mt-1">
          {new Date().toLocaleDateString('en-PH', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      {/* Low stock alerts */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-white mb-4">Low stock alerts</h2>
        <div className="divide-y divide-white/5">
          {lowStockItems.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-white/90">{item.name}</p>
                <p className="text-xs text-white/30 mt-0.5">{item.category}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-semibold tabular-nums ${item.quantity === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                  {item.quantity}
                </span>
                {item.quantity === 0 ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                    Out of stock
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Low stock
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stock by category */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-white">Stock by category</h2>
          <span className="text-xs text-white/30">{stockByCategory.length} categories</span>
        </div>
        <div className="space-y-4">
          {stockByCategory.map((c: any, i: number) => {
            const pct = Math.round((c.quantity / maxQty) * 100)
            return (
              <div key={c.id}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-white/80">{c.name}</span>
                  <span className="text-xs text-white/30 tabular-nums">
                    {c.quantity.toLocaleString()} units · {c.itemCount} items
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${BAR_COLORS[i % BAR_COLORS.length]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

export default DashboardPage