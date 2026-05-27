import { useEffect, useState } from 'react'
import { api, type Category, type InventoryItem, type Paginated } from '../api'

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
// To change badge colors: edit the values in STATUS_STYLES below
const STATUS_STYLES: Record<string, string> = {
  available:    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  low_stock:    'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  out_of_stock: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? 'bg-white/10 text-white/40 border border-white/10'
  // ↓ Change badge shape here (rounded-full = pill, rounded-md = square-ish)
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  if (!message) return null
  const styles = {
    success: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400',
    error:   'bg-red-500/10 border border-red-500/20 text-red-400',
  }
  return <div className={`text-sm rounded-xl px-4 py-3 ${styles[type]}`}>{message}</div>
}

// ─── REUSABLE FORM PRIMITIVES ─────────────────────────────────────────────────
// ↓ To restyle all form inputs globally, edit Input and Select classNames here
function Input({ name, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { name: string }) {
  return (
    <input
      name={name}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
      {...props}
    />
  )
}

function Select({ name, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { name: string }) {
  return (
    <select
      name={name}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 [&>option]:bg-neutral-900"
      {...props}
    >
      {children}
    </select>
  )
}

function Label({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      {/* ↓ Change field label style here */}
      <span className="text-xs text-white/40 font-medium uppercase tracking-wide">{label}</span>
      {children}
    </label>
  )
}

// ─── STATUS FILTER PILLS ──────────────────────────────────────────────────────
// To add a new filter option: add an entry to FILTER_OPTIONS below
const FILTER_OPTIONS = [
  { value: '',             label: 'All' },
  { value: 'available',   label: 'Available' },
  { value: 'low_stock',   label: 'Low stock' },
  { value: 'out_of_stock',label: 'Out of stock' },
]

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [status, setStatus] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

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

  useEffect(() => { load() }, [status])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    setError('')
    const form = new FormData(e.currentTarget)
    try {
      await api.post('/inventory-items', {
        category_id:   Number(form.get('category_id')),
        item_code:     form.get('item_code'),
        name:          form.get('name'),
        quantity:      Number(form.get('quantity')),
        reorder_level: Number(form.get('reorder_level')),
        location:      form.get('location'),
      })
      setMessage('Item created. Outgoing webhook fired if subscribed.')
      e.currentTarget.reset()
      setShowForm(false)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item')
    }
  }

  return (
    // ↓ Change page max-width and outer padding here
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Inventory</h1>
          <p className="text-sm text-white/30 mt-1">{items.length} item{items.length !== 1 ? 's' : ''} total</p>
        </div>
        {/* ↓ Change "Add item" button style here */}
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-white text-black text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/90 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add item'}
        </button>
      </div>

      {/* ── Toasts ───────────────────────────────────────────────────────── */}
      {message && <Toast message={message} type="success" />}
      {error   && <Toast message={error}   type="error"   />}

      {/* ── Status filter pills ───────────────────────────────────────────
          To add more filters: edit FILTER_OPTIONS array above               */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatus(opt.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              status === opt.value
                // ↓ Change active filter pill color here
                ? 'bg-white text-black'
                // ↓ Change inactive filter pill color here
                : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/10'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── Add item form (collapsible) ───────────────────────────────────
          To add a new field: copy a <Label> block and add field to
          handleCreate's api.post body above                                 */}
      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h2 className="text-sm font-medium text-white mb-5">Add item</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Label label="Category">
                <Select name="category_id" required>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </Label>
              <Label label="Item code">
                <Input name="item_code" required placeholder="EQP-003" />
              </Label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Label label="Name">
                <Input name="name" required placeholder="Item name" />
              </Label>
              <Label label="Location">
                <Input name="location" placeholder="Warehouse A" />
              </Label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Label label="Quantity">
                <Input name="quantity" type="number" min="0" defaultValue={0} />
              </Label>
              <Label label="Reorder level">
                <Input name="reorder_level" type="number" min="0" defaultValue={10} />
              </Label>
            </div>

            {/* ↓ Change submit button style here */}
            <div className="pt-1">
              <button
                type="submit"
                className="bg-white text-black text-sm font-medium px-5 py-2 rounded-xl hover:bg-white/90 transition-colors"
              >
                Save item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Inventory table ───────────────────────────────────────────────
          To add a column: add a <th> in thead + matching <td> in tbody     */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {/* ↓ Change table header style here */}
              <tr className="text-left text-xs text-white/30 border-b border-white/5">
                <th className="pb-2 font-normal pr-4">Code</th>
                <th className="pb-2 font-normal pr-4">Name</th>
                <th className="pb-2 font-normal pr-4">Category</th>
                <th className="pb-2 font-normal pr-4 text-right">Qty</th>
                <th className="pb-2 font-normal pr-4 text-right">Reorder</th>
                <th className="pb-2 font-normal pr-4">Status</th>
                <th className="pb-2 font-normal">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-white/20 text-sm">
                    No items found.
                  </td>
                </tr>
              )}
              {items.map((item) => (
                // ↓ Change row hover style here
                <tr key={item.id} className="text-white/60 hover:bg-white/[0.03] transition-colors">
                  <td className="py-2.5 pr-4 text-xs text-white/30 font-mono">{item.item_code}</td>
                  <td className="py-2.5 pr-4 font-medium text-white/90 whitespace-nowrap">{item.name}</td>
                  <td className="py-2.5 pr-4 text-white/50">{item.category?.name ?? '—'}</td>
                  <td className="py-2.5 pr-4 text-right font-semibold text-white">{item.quantity}</td>
                  <td className="py-2.5 pr-4 text-right text-white/30">{item.reorder_level}</td>
                  <td className="py-2.5 pr-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-2.5 text-white/30 text-xs">{item.location ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}