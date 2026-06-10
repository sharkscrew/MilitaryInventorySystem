import AxiosInstance from '../services/AxiosInstance'
import { useEffect, useState } from 'react'
import type { InventoryItem, Paginated, StockTransaction } from '../types'
import ToastMessage from '../components/ToastMessage/ToastMessage'
import SubmitButton from '../components/Button/SubmitButton'
import CloseButton from '../components/Button/CloseButton'
import RemoveButton from '../components/Button/RemoveButton'
import ModalCloseButton from '../components/Button/modalCloseButton'

type Transaction = StockTransaction & { reference_no?: string; remarks?: string }

const TYPE_STYLES: Record<string, string> = {
  receive: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  issue: 'bg-red-500/10 text-red-400 border border-red-500/20',
  return: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  adjustment: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
}

const TypeBadge = ({ type }: { type: string }) => {
  const style = TYPE_STYLES[type] ?? 'bg-white/10 text-white/50 border border-white/10'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {type}
    </span>
  )
}

const Input = ({ name, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { name: string }) => (
  <input
    name={name}
    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
    {...props}
  />
)

const Select = ({ name, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { name: string }) => (
  <select
    name={name}
    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 [&>option]:bg-neutral-900"
    {...props}
  >
    {children}
  </select>
)

const Label = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs text-white/40 font-medium uppercase tracking-wide">{label}</span>
    {children}
  </label>
)

const DeleteModal = ({
  transaction, onConfirm, onCancel, loading,
}: {
  transaction: Transaction
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
    <div className="relative bg-neutral-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4">
      <ModalCloseButton onClose={onCancel} />
      <div>
        <h3 className="text-white font-medium text-base">Delete transaction?</h3>
        <p className="text-white/40 text-sm mt-1">
          This will permanently remove the{' '}
          <span className="text-white/70 font-medium">{transaction.type}</span> record for{' '}
          <span className="text-white/70 font-medium">{transaction.inventory_item?.name ?? '—'}</span>.
          This cannot be undone.
        </p>
      </div>
      <div className="flex gap-3 pt-1">
        <CloseButton
          label="Cancel"
          onClose={onCancel}
          newClassName="flex-1 bg-white/5 border border-white/10 text-white/70 text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/10 transition-colors"
        />
        <RemoveButton
          label={loading ? 'Deleting…' : 'Delete'}
          onRemove={onConfirm}
          newClassname="flex-1 bg-red-500/80 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-red-500 transition-colors disabled:opacity-50"
        />
      </div>
    </div>
  </div>
)

const EditModal = ({
  transaction, items, onSave, onCancel, loading,
}: {
  transaction: Transaction
  items: InventoryItem[]
  onSave: (id: number, data: Partial<Transaction>) => void
  onCancel: () => void
  loading: boolean
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    onSave(transaction.id, {
      inventory_item_id: Number(form.get('inventory_item_id')),
      type: form.get('type') as string,
      quantity: Number(form.get('quantity')),
      personnel_name: form.get('personnel_name') as string,
      reference_no: form.get('reference_no') as string,
      remarks: form.get('remarks') as string,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative bg-neutral-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg space-y-5">
        <ModalCloseButton onClose={onCancel} />
        <div>
          <h3 className="text-white font-medium text-base">Edit transaction</h3>
          <p className="text-white/30 text-xs mt-0.5">Changes will recalculate the balance on the backend.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Label label="Item">
              <Select name="inventory_item_id" required defaultValue={transaction.inventory_item?.id}>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>{item.item_code} — {item.name}</option>
                ))}
              </Select>
            </Label>
            <Label label="Type">
              <Select name="type" required defaultValue={transaction.type}>
                <option value="receive">Receive</option>
                <option value="issue">Issue</option>
                <option value="return">Return</option>
                <option value="adjustment">Adjustment</option>
              </Select>
            </Label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Label label="Quantity">
              <Input name="quantity" type="number" min="1" required defaultValue={transaction.quantity} />
            </Label>
            <Label label="Personnel name">
              <Input name="personnel_name" required defaultValue={transaction.personnel_name} />
            </Label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Label label="Reference no.">
              <Input name="reference_no" defaultValue={transaction.reference_no ?? ''} placeholder="ISS-2026-001" />
            </Label>
            <Label label="Remarks">
              <Input name="remarks" defaultValue={transaction.remarks ?? ''} placeholder="Optional notes…" />
            </Label>
          </div>
          <div className="flex gap-3 pt-1">
            <CloseButton
              label="Cancel"
              onClose={onCancel}
              newClassName="flex-1 bg-white/5 border border-white/10 text-white/70 text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/10 transition-colors"
            />
            <SubmitButton
              label="Save changes"
              loading={loading}
              loadingLabel="Saving…"
              newClassName="flex-1 bg-white text-black text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </form>
      </div>
    </div>
  )
}

const StockPage = () => {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [message, setMessage] = useState('')
  const [isFailed, setIsFailed] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [editTarget, setEditTarget] = useState<Transaction | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  const showToast = (msg: string, failed = false) => {
    setMessage(msg)
    setIsFailed(failed)
    setToastVisible(true)
  }

  const load = () => {
    Promise.all([
      AxiosInstance.get<Paginated<InventoryItem>>('/inventory-items'),
      AxiosInstance.get<Paginated<Transaction>>('/stock-transactions'),
    ])
      .then(([inv, tx]) => {
        setItems(inv.data.data)
        setTransactions(tx.data.data)
      })
      .catch((e: Error) => showToast(e.message, true))
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formEl = e.currentTarget
    setSubmitLoading(true)
    const form = new FormData(formEl)
    try {
      await AxiosInstance.post('/stock-transactions', {
        inventory_item_id: Number(form.get('inventory_item_id')),
        type: form.get('type'),
        quantity: Number(form.get('quantity')),
        personnel_name: form.get('personnel_name'),
        reference_no: form.get('reference_no'),
        remarks: form.get('remarks'),
      })
      showToast('Stock recorded. Webhooks sent for stock.transaction / stock.low.')
      formEl.reset()
      load()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to record stock', true)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleEdit = async (id: number, data: Partial<Transaction>) => {
    setActionLoading(true)
    try {
      await AxiosInstance.put(`/stock-transactions/${id}`, data)
      showToast('Transaction updated successfully.')
      setEditTarget(null)
      load()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update transaction', true)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setActionLoading(true)
    try {
      await AxiosInstance.delete(`/stock-transactions/${deleteTarget.id}`)
      showToast('Transaction deleted.')
      setDeleteTarget(null)
      load()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete transaction', true)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

      <ToastMessage
        message={message}
        isFailed={isFailed}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />

      {editTarget && (
        <EditModal
          transaction={editTarget}
          items={items}
          onSave={handleEdit}
          onCancel={() => setEditTarget(null)}
          loading={actionLoading}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          transaction={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={actionLoading}
        />
      )}

      <div>
        <h1 className="text-2xl font-semibold text-white">Stock In / Out</h1>
        <p className="text-sm text-white/30 mt-1">
          Digital audit trail with personnel name and balance after each movement.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-white mb-5">Record movement</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Label label="Item">
              <Select name="inventory_item_id" required>
                <option value="">Select item…</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.item_code} — {item.name} (qty: {item.quantity})
                  </option>
                ))}
              </Select>
            </Label>
            <Label label="Type">
              <Select name="type" required>
                <option value="receive">Receive</option>
                <option value="issue">Issue</option>
                <option value="return">Return</option>
                <option value="adjustment">Adjustment</option>
              </Select>
            </Label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Label label="Quantity">
              <Input name="quantity" type="number" min="1" required placeholder="0" />
            </Label>
            <Label label="Personnel name">
              <Input name="personnel_name" required placeholder="Rank Name" />
            </Label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Label label="Reference no.">
              <Input name="reference_no" placeholder="ISS-2026-001" />
            </Label>
            <Label label="Remarks">
              <Input name="remarks" placeholder="Optional notes…" />
            </Label>
          </div>
          <div className="pt-1">
            <SubmitButton
              label="Record movement"
              loading={submitLoading}
              loadingLabel="Recording…"
              newClassName="bg-white text-black text-sm font-medium px-5 py-2 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </form>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-white mb-4">Transaction history</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-white/30 border-b border-white/5">
                <th className="pb-2 font-normal pr-4">Date</th>
                <th className="pb-2 font-normal pr-4">Item</th>
                <th className="pb-2 font-normal pr-4">Type</th>
                <th className="pb-2 font-normal pr-4 text-right">Qty</th>
                <th className="pb-2 font-normal pr-4">Personnel</th>
                <th className="pb-2 font-normal pr-4">Ref no.</th>
                <th className="pb-2 font-normal pr-4 text-right">Balance after</th>
                <th className="pb-2 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-white/20 text-sm">No transactions yet.</td>
                </tr>
              )}
              {transactions.map((t) => (
                <tr key={t.id} className="text-white/60 hover:bg-white/3 transition-colors">
                  <td className="py-2.5 pr-4 text-white/30 whitespace-nowrap text-xs">
                    {new Date(t.created_at).toLocaleString('en-PH', {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="py-2.5 pr-4 font-medium text-white/90 whitespace-nowrap">{t.inventory_item?.name ?? '—'}</td>
                  <td className="py-2.5 pr-4"><TypeBadge type={t.type} /></td>
                  <td className="py-2.5 pr-4 text-right font-medium text-white/90">{t.quantity}</td>
                  <td className="py-2.5 pr-4 text-white/50">{t.personnel_name}</td>
                  <td className="py-2.5 pr-4 text-white/30 text-xs">{t.reference_no ?? '—'}</td>
                  <td className="py-2.5 pr-4 text-right font-semibold text-white">{t.balance_after}</td>
                  <td className="py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditTarget(t)}
                        className="px-2.5 py-1 rounded-lg text-xs text-white/50 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white/80 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(t)}
                        className="px-2.5 py-1 rounded-lg text-xs text-red-400/70 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default StockPage