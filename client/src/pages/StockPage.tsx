import { useEffect, useState } from 'react'
import { api, type InventoryItem, type Paginated, type StockTransaction } from '../api'

export function StockPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = () => {
    Promise.all([
      api.get<Paginated<InventoryItem>>('/inventory-items'),
      api.get<Paginated<StockTransaction>>('/stock-transactions'),
    ])
      .then(([inv, tx]) => {
        setItems(inv.data)
        setTransactions(tx.data)
      })
      .catch((e: Error) => setError(e.message))
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    setError('')
    const form = new FormData(e.currentTarget)
    try {
      await api.post('/stock-transactions', {
        inventory_item_id: Number(form.get('inventory_item_id')),
        type: form.get('type'),
        quantity: Number(form.get('quantity')),
        personnel_name: form.get('personnel_name'),
        reference_no: form.get('reference_no'),
        remarks: form.get('remarks'),
      })
      setMessage('Stock recorded. Webhooks sent for stock.transaction / stock.low.')
      e.currentTarget.reset()
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record stock')
    }
  }

  return (
    <div className="page">
      <h2>Stock in / out</h2>
      <p className="muted">Solution: digital audit trail with personnel name and balance after each movement.</p>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <form className="form-grid panel" onSubmit={handleSubmit}>
        <label>
          Item
          <select name="inventory_item_id" required>
            <option value="">Select item…</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.item_code} — {item.name} (qty: {item.quantity})
              </option>
            ))}
          </select>
        </label>
        <label>
          Type
          <select name="type" required>
            <option value="receive">Receive</option>
            <option value="issue">Issue</option>
            <option value="return">Return</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </label>
        <label>
          Quantity
          <input name="quantity" type="number" min="1" required />
        </label>
        <label>
          Personnel name
          <input name="personnel_name" required placeholder="Rank Name" />
        </label>
        <label>
          Reference no.
          <input name="reference_no" placeholder="ISS-2026-001" />
        </label>
        <label className="full">
          Remarks
          <input name="remarks" />
        </label>
        <button type="submit">Record movement</button>
      </form>

      <section className="panel">
        <h3>Transaction history</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Item</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Personnel</th>
              <th>Balance after</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
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
