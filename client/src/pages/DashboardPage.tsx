import { useEffect, useState } from 'react'
import AxiosInstance from '../services/AxiosInstance'
import type { DashboardInventoryItem } from '../types'

const BAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
]

const STATUS_STYLES: Record<string, string> = {
  available: 'bg-emerald-500 text-white',
  low_stock: 'bg-amber-500 text-white',
  out_of_stock: 'bg-red-500 text-white',
}

const BoxIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-9 h-9 text-white/40 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
    />
  </svg>
)

const ItemCard = ({ item }: { item: DashboardInventoryItem }) => {
  const statusStyle =
    STATUS_STYLES[item.status] ?? 'bg-white/20 text-white/70'

  const meta = item.category
    ? `${item.item_code} - ${item.category}`
    : item.item_code

  return (
    <div className="relative bg-[#2e2c2a] border border-white/5 rounded-xl p-4 min-h-[120px]">
      <div className="flex items-start gap-3 pr-20">
        <BoxIcon />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white leading-snug truncate" title={item.name}>
            {item.name}
          </p>
          <p className="text-4xl font-bold tabular-nums text-white mt-1 leading-none">
            {item.quantity}
          </p>
          <p className="text-xs text-white/35 truncate mt-2" title={meta}>
            {meta}
          </p>
        </div>
      </div>
      <span
        className={`absolute bottom-3 right-3 inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium capitalize ${statusStyle}`}
      >
        {item.status.replace(/_/g, ' ')}
      </span>
    </div>
  )
}

interface CategoryStock {
  id: number
  name: string
  quantity: number
  itemCount: number
}

const DashboardPage = () => {
  const [allItems, setAllItems] = useState<DashboardInventoryItem[]>([])
  const [stockByCategory, setStockByCategory] = useState<CategoryStock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    AxiosInstance.get('/dashboard')
      .then((res) => {
        setAllItems(res.data.inventory_items ?? [])
        setStockByCategory(res.data.stock_by_category ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const maxQty = Math.max(...stockByCategory.map((c) => c.quantity ?? 0), 1)

  if (loading) {
    return (
      <div className="text-white/40 text-sm py-24 text-center animate-pulse">
        Loading…
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {allItems.length === 0 ? (
        <p className="py-24 text-center text-sm text-white/30">No inventory items yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {stockByCategory.length > 0 && (
        <div className="bg-[#2e2c2a] border border-white/5 rounded-xl p-6">
          <h2 className="text-sm font-medium text-white mb-5">Stock by category</h2>
          <div className="space-y-5">
            {stockByCategory.map((c, i) => {
              const pct = Math.round((c.quantity / maxQty) * 100)
              return (
                <div key={c.id}>
                  <p className="text-sm text-white/80 mb-2">{c.name}</p>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
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
      )}
    </div>
  )
}

export default DashboardPage
