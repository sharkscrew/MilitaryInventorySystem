import { useEffect, useState } from 'react'
import { api, type DashboardSummary } from '../api'

const BAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
]

type TransactionType = 'in' | 'out' | 'adjustment'

function StatCard({
  icon,
  label,
  value,
  iconBg,
  badge,
}: {
  icon: string
  label: string
  value: string | number
  iconBg: string
  badge?: React.ReactNode
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
        <span className="text-xl">{icon}</span>
      </div>
      <span className="text-sm text-white/50">{label}</span>
      <span className="text-3xl font-semibold text-white leading-none">{value}</span>
      {badge}
    </div>
  )
}

function Badge({ type }: { type: TransactionType }) {
  const styles: Record<TransactionType, string> = {
    in: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    out: 'bg-red-500/10 text-red-400 border border-red-500/20',
    adjustment: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[type] ?? styles.adjustment}`}>
      {type}
    </span>
  )
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<DashboardSummary>('/dashboard')
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <div className="flex items-center justify-center py-24 text-white/40 text-sm">
        Loading dashboard…
      </div>
    )

  if (error)
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mx-4 mt-6">
        {error}
      </div>
    )

  if (!data) return null

  const maxQty = Math.max(...data.stock_by_category.map((c) => c.total_quantity ?? 0), 1)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-white/40 mt-1">
          {new Date().toLocaleDateString('en-PH', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      {/* Low stock alert banner */}
      {data.low_stock_items > 0 && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-amber-300">
          <span className="text-base flex-shrink-0">⚠️</span>
          <span>
            <strong>{data.low_stock_items}</strong> product{data.low_stock_items > 1 ? 's are' : ' is'} running low or out of stock. Review the items below.
          </span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon="📦"
          label="Total products"
          value={data.total_items}
          iconBg="bg-blue-500/10"
        />
        <StatCard
          icon="⚠️"
          label="Low / out of stock"
          value={data.low_stock_items}
          iconBg="bg-amber-500/10"
          badge={
            data.low_stock_items > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit">
                Needs attention
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
                ✓ All good
              </span>
            )
          }
        />
        <StatCard
          icon="🗂️"
          label="Total quantity"
          value={data.total_quantity.toLocaleString()}
          iconBg="bg-emerald-500/10"
          badge={<span className="text-xs text-white/30">units in stock</span>}
        />
      </div>

      {/* Two-column panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Stock by category */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-sm font-medium text-white mb-4">Stock by category</h2>
          <div className="space-y-4">
            {data.stock_by_category.map((c, i) => {
              const pct = Math.round(((c.total_quantity ?? 0) / maxQty) * 100)
              return (
                <div key={c.id}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm text-white/80">{c.name}</span>
                    <span className="text-xs text-white/30">
                      {(c.total_quantity ?? 0).toLocaleString()} units &middot; {c.inventory_items_count ?? 0} items
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Low stock items */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-sm font-medium text-white mb-4">Low stock items</h2>
          {data.low_stock_items === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-white/30 text-sm gap-2">
              <span className="text-2xl">✓</span>
              All products are well stocked
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {data.stock_by_category
                .filter((c) => (c.total_quantity ?? 0) <= 10)
                .map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-white/90">{c.name}</p>
                      <p className="text-xs text-white/30">{c.inventory_items_count ?? 0} items</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">
                        {c.total_quantity ?? 0}
                      </span>
                      {(c.total_quantity ?? 0) === 0 ? (
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
          )}
        </div>
      </div>

      {/* Recent stock movements */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-white mb-4">Recent stock movements</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-white/30 border-b border-white/5">
                <th className="pb-2 font-normal pr-4">Date</th>
                <th className="pb-2 font-normal pr-4">Product</th>
                <th className="pb-2 font-normal pr-4">Type</th>
                <th className="pb-2 font-normal pr-4 text-right">Qty</th>
                <th className="pb-2 font-normal pr-4">Personnel</th>
                <th className="pb-2 font-normal text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.recent_transactions.map((t) => (
                <tr key={t.id} className="text-white/70">
                  <td className="py-2.5 pr-4 text-white/30 whitespace-nowrap text-xs">
                    {new Date(t.created_at).toLocaleString('en-PH', {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="py-2.5 pr-4 font-medium text-white/90 whitespace-nowrap">
                    {t.inventory_item?.name ?? '—'}
                  </td>
                  <td className="py-2.5 pr-4">
                    <Badge type={t.type as TransactionType} />
                  </td>
                  <td className="py-2.5 pr-4 text-right font-medium text-white/90">{t.quantity}</td>
                  <td className="py-2.5 pr-4 text-white/50">{t.personnel_name}</td>
                  <td className="py-2.5 text-right font-semibold text-white">{t.balance_after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}