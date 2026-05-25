import { useEffect, useState } from 'react'
import { api, type Category, type InventoryItem, type Paginated } from '../api'

export function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [status, setStatus] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = () => {
    const query = status ? `?status=${status}` : ''
    Promise.all([
      api.get<Paginated<InventoryItem>>(`/inventory-items${query}`),
      api.get<Category[]>('/categories'),
    ])
      .then(([inv, cats]) => {
        setItems(inv.data)
        setCategories(cats)
      })
      .catch((e: Error) => setError(e.message))
  }

  useEffect(() => {
    load()
  }, [status])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    setError('')
    const form = new FormData(e.currentTarget)
    try {
      await api.post('/inventory-items', {
        category_id: Number(form.get('category_id')),
        item_code: form.get('item_code'),
        name: form.get('name'),
        quantity: Number(form.get('quantity')),
        reorder_level: Number(form.get('reorder_level')),
        location: form.get('location'),
      })
      setMessage('Item created. Outgoing webhook fired if subscribed.')
      e.currentTarget.reset()
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item')
    }
  }

  return (
    <div className="page">
      <h2>Inventory</h2>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <div className="toolbar">
        <label>
          Filter status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="available">Available</option>
            <option value="low_stock">Low stock</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </label>
      </div>

      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Category</th>
            <th>Qty</th>
            <th>Reorder</th>
            <th>Status</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.item_code}</td>
              <td>{item.name}</td>
              <td>{item.category?.name}</td>
              <td>{item.quantity}</td>
              <td>{item.reorder_level}</td>
              <td>
                <span className={`badge ${item.status}`}>{item.status}</span>
              </td>
              <td>{item.location ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="panel">
        <h3>Add item</h3>
        <form className="form-grid" onSubmit={handleCreate}>
          <label>
            Category
            <select name="category_id" required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Item code
            <input name="item_code" required placeholder="EQP-003" />
          </label>
          <label>
            Name
            <input name="name" required />
          </label>
          <label>
            Quantity
            <input name="quantity" type="number" min="0" defaultValue={0} />
          </label>
          <label>
            Reorder level
            <input name="reorder_level" type="number" min="0" defaultValue={10} />
          </label>
          <label>
            Location
            <input name="location" placeholder="Warehouse A" />
          </label>
          <button type="submit">Save item</button>
        </form>
      </section>
    </div>
  )
}
