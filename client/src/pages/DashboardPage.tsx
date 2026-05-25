import { useEffect, useState } from 'react'
import { api, type DashboardSummary } from '../api'

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

  if (loading) return <p className="muted">Loading dashboard…</p>
  if (error) return <p className="error">{error}</p>
  if (!data) return null

  return (
    <div className="page">
      <h2>Dashboard</h2>
      <div className="stats">
        <div className="stat-card">
          <span className="stat-label">Total items</span>
          <strong>{data.total_items}</strong>
        </div>
        <div className="stat-card warn">
          <span className="stat-label">Low / out of stock</span>
          <strong>{data.low_stock_items}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total quantity</span>
          <strong>{data.total_quantity}</strong>
        </div>
      </div>

      <section className="panel">
        <h3>Stock by category</h3>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Items</th>
              <th>Total qty</th>
            </tr>
          </thead>
          <tbody>
            {data.stock_by_category.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.inventory_items_count ?? 0}</td>
                <td>{c.total_quantity ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h3>Recent stock movements</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Item</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Personnel</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {data.recent_transactions.map((t) => (
              <tr key={t.id}>
                <td>{new Date(t.created_at).toLocaleString()}</td>
                <td>{t.inventory_item?.name ?? '—'}</td>
                <td>{t.type}</td>
                <td>{t.quantity}</td>
                <td>{t.personnel_name}</td>
                <td>{t.balance_after}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
