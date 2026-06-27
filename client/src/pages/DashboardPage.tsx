import { useEffect, useState } from 'react'
import AxiosInstance from '../services/AxiosInstance'
import type { DashboardInventoryItem } from '../types'

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6']

const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
  const rad = ((angle - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

const describeDonutSlice = (
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
) => {
  if (endAngle - startAngle >= 359.99) {
    return [
      `M ${cx} ${cy - outerR}`,
      `A ${outerR} ${outerR} 0 1 1 ${cx - 0.01} ${cy - outerR}`,
      `L ${cx - 0.01} ${cy - innerR}`,
      `A ${innerR} ${innerR} 0 1 0 ${cx} ${cy - innerR}`,
      'Z',
    ].join(' ')
  }

  const startOuter = polarToCartesian(cx, cy, outerR, startAngle)
  const endOuter = polarToCartesian(cx, cy, outerR, endAngle)
  const startInner = polarToCartesian(cx, cy, innerR, endAngle)
  const endInner = polarToCartesian(cx, cy, innerR, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ')
}

interface CategoryStock {
  id: number
  name: string
  quantity: number
  itemCount: number
}

const CategoryDonutChart = ({ categories }: { categories: CategoryStock[] }) => {
  const total = categories.reduce((sum, c) => sum + c.quantity, 0)
  const cx = 100
  const cy = 100
  const outerR = 80
  const innerR = 52

  let currentAngle = 0
  const slices = categories.map((category, i) => {
    const sweep = total > 0 ? (category.quantity / total) * 360 : 0
    const startAngle = currentAngle
    const endAngle = currentAngle + sweep
    currentAngle = endAngle

    return {
      ...category,
      color: CHART_COLORS[i % CHART_COLORS.length],
      path: describeDonutSlice(cx, cy, outerR, innerR, startAngle, endAngle),
      pct: total > 0 ? Math.round((category.quantity / total) * 100) : 0,
    }
  })

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
      <div className="relative shrink-0 w-48 h-48 sm:w-52 sm:h-52">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90" aria-hidden="true">
          {total === 0 ? (
            <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={outerR - innerR} />
          ) : (
            slices.map((slice) => (
              <path
                key={slice.id}
                d={slice.path}
                fill={slice.color}
                className="transition-opacity hover:opacity-80"
              />
            ))
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl sm:text-3xl font-bold tabular-nums text-white">{total.toLocaleString()}</span>
          <span className="text-xs text-white/40 mt-0.5">total units</span>
        </div>
      </div>

      <div className="w-full sm:flex-1 space-y-3">
        {slices.map((slice) => (
          <div key={slice.id} className="flex items-center gap-3 min-w-0">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: slice.color }}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white/80 truncate" title={slice.name}>{slice.name}</p>
              <p className="text-xs text-white/35">
                {slice.quantity.toLocaleString()} units · {slice.pct}% · {slice.itemCount} item{slice.itemCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

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
    <div className="relative bg-[#2e2c2a] border border-white/5 rounded-xl p-3 sm:p-4 min-h-[110px] sm:min-h-[120px]">
      <div className="flex items-start gap-2 sm:gap-3 pr-16 sm:pr-20">
        <BoxIcon />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white leading-snug truncate" title={item.name}>
            {item.name}
          </p>
          <p className="text-3xl sm:text-4xl font-bold tabular-nums text-white mt-1 leading-none">
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

  if (loading) {
    return (
      <div className="text-white/40 text-sm py-24 text-center animate-pulse">
        Loading…
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
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
        <div className="bg-[#2e2c2a] border border-white/5 rounded-xl p-4 sm:p-6">
          <h2 className="text-sm font-medium text-white mb-5">Stock by category</h2>
          <CategoryDonutChart categories={stockByCategory} />
        </div>
      )}
    </div>
  )
}

export default DashboardPage
