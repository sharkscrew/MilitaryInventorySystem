import AxiosInstance from '../services/AxiosInstance'
import { useEffect, useState } from 'react'
import type { Paginated, WebhookDelivery, WebhookSubscription } from '../types'
import ToastMessage from '../components/ToastMessage/ToastMessage'
import SubmitButton from '../components/Button/SubmitButton'
import CloseButton from '../components/Button/CloseButton'
import RemoveButton from '../components/Button/RemoveButton'
import ModalCloseButton from '../components/Button/modalCloseButton'

const DeliveryBadge = ({ success }: { success: boolean }) =>
  success ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      ✓ Success
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
      ✗ Failed
    </span>
  )

const DirectionBadge = ({ direction }: { direction: string }) => {
  const style = direction === 'outgoing'
    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
    : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {direction}
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

const Label = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-xs text-white/40 font-medium uppercase tracking-wide">{label}</span>
    {children}
  </label>
)

const DeleteSubscriptionModal = ({
  subscription, onConfirm, onCancel, loading,
}: {
  subscription: WebhookSubscription
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
    <div className="relative bg-neutral-900 border border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-sm space-y-4">
      <ModalCloseButton onClose={onCancel} />
      <div>
        <h3 className="text-white font-medium text-base">Delete webhook?</h3>
        <p className="text-white/40 text-sm mt-1">
          This will remove{' '}
          <span className="text-white/70 font-medium">{subscription.name}</span>{' '}
          and stop outgoing notifications to its target URL. Delivery history will be kept.
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

const WebhooksPage = () => {
  const [events, setEvents] = useState<string[]>([])
  const [subscriptions, setSubscriptions] = useState<WebhookSubscription[]>([])
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([])
  const [message, setMessage] = useState('')
  const [isFailed, setIsFailed] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<WebhookSubscription | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const showToast = (msg: string, failed = false) => {
    setMessage(msg)
    setIsFailed(failed)
    setToastVisible(true)
  }

  const load = () => {
    Promise.all([
      AxiosInstance.get<{ events: string[] }>('/webhooks/events'),
      AxiosInstance.get<WebhookSubscription[]>('/webhooks/subscriptions'),
      AxiosInstance.get<Paginated<WebhookDelivery>>('/webhooks/deliveries'),
    ])
      .then(([ev, subs, del]) => {
        setEvents(ev.data.events)
        setSubscriptions(subs.data)
        setDeliveries(del.data.data)
      })
      .catch((e: Error) => showToast(e.message, true))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await AxiosInstance.delete(`/webhooks/subscriptions/${deleteTarget.id}`)
      showToast('Webhook subscription deleted.')
      setDeleteTarget(null)
      load()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete webhook', true)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formEl = e.currentTarget
    setLoading(true)
    const form = new FormData(formEl)
    const selected = form.getAll('events') as string[]
    try {
      await AxiosInstance.post('/webhooks/subscriptions', {
        name: form.get('name'),
        target_url: form.get('target_url'),
        secret: form.get('secret'),
        events: selected.length ? selected : events,
        is_active: true,
      })
      showToast('Subscription saved. Outgoing webhooks will POST to your URL with X-Webhook-Signature.')
      formEl.reset()
      load()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save subscription', true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">

      <ToastMessage
        message={message}
        isFailed={isFailed}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />

      {deleteTarget && (
        <DeleteSubscriptionModal
          subscription={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-white">Webhooks</h1>
        <p className="text-sm text-white/30 mt-1 wrap-break-word">
          Outgoing: Laravel notifies external URLs on inventory/stock events (HMAC signature).
          Incoming: <code className="font-mono text-white/50 break-all">POST /api/webhooks/incoming</code> for procurement sync.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
        <h2 className="text-sm font-medium text-white mb-4">Available events</h2>
        <div className="flex flex-wrap gap-2">
          {events.map((ev) => (
            <span key={ev} className="px-3 py-1 rounded-xl text-xs font-mono bg-white/5 text-white/50 border border-white/10">
              {ev}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
        <h2 className="text-sm font-medium text-white mb-1">Register outgoing webhook</h2>
        <p className="text-xs text-white/30 mb-5">Use your URL from webhook.site for the defense demo.</p>
        <form onSubmit={handleSubscribe} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Label label="Name">
              <Input name="name" required placeholder="Slack / webhook.site" />
            </Label>
            <Label label="Secret (min 16 chars)">
              <Input name="secret" required defaultValue="demo-webhook-secret-change-me-32" />
            </Label>
          </div>
          <Label label="Target URL">
            <Input name="target_url" type="url" required placeholder="https://webhook.site/…" />
          </Label>
          <div>
            <span className="text-xs text-white/40 font-medium uppercase tracking-wide block mb-2">Events</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {events.map((ev) => (
                <label key={ev} className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" name="events" value={ev} defaultChecked className="accent-white w-3.5 h-3.5" />
                  <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors font-mono">{ev}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="pt-1">
            <SubmitButton
              label="Save subscription"
              loading={loading}
              loadingLabel="Saving…"
              newClassName="bg-white text-black text-sm font-medium px-5 py-2 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </form>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
        <h2 className="text-sm font-medium text-white mb-4">Active subscriptions</h2>
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs text-white/30 border-b border-white/5">
                <th className="pb-2 font-normal pr-4">Name</th>
                <th className="pb-2 font-normal pr-4">URL</th>
                <th className="pb-2 font-normal pr-4">Events</th>
                <th className="pb-2 font-normal pr-4">Active</th>
                <th className="pb-2 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-white/20 text-sm">No subscriptions yet.</td>
                </tr>
              )}
              {subscriptions.map((s) => (
                <tr key={s.id} className="text-white/60 hover:bg-white/3 transition-colors">
                  <td className="py-2.5 pr-4 font-medium text-white/90">{s.name}</td>
                  <td className="py-2.5 pr-4 text-white/30 text-xs font-mono max-w-[200px] truncate">{s.target_url}</td>
                  <td className="py-2.5 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {s.events.map((ev) => (
                        <span key={ev} className="px-1.5 py-0.5 rounded text-xs font-mono bg-white/5 text-white/30">{ev}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.is_active
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-white/5 text-white/30 border border-white/10'
                      }`}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(s)}
                      className="px-2.5 py-1 rounded-lg text-xs text-red-400/70 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
        <h2 className="text-sm font-medium text-white mb-1">Delivery log</h2>
        <p className="text-xs text-white/30 mb-4">Proof of outgoing webhook delivery for demo.</p>
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="text-left text-xs text-white/30 border-b border-white/5">
                <th className="pb-2 font-normal pr-4">Time</th>
                <th className="pb-2 font-normal pr-4">Direction</th>
                <th className="pb-2 font-normal pr-4">Event</th>
                <th className="pb-2 font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {deliveries.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-white/20 text-sm">No deliveries yet.</td>
                </tr>
              )}
              {deliveries.map((d) => (
                <tr key={d.id} className="text-white/60 hover:bg-white/3 transition-colors">
                  <td className="py-2.5 pr-4 text-white/30 whitespace-nowrap text-xs">
                    {new Date(d.created_at).toLocaleString('en-PH', {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="py-2.5 pr-4"><DirectionBadge direction={d.direction} /></td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-white/50">{d.event}</td>
                  <td className="py-2.5"><DeliveryBadge success={d.success} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default WebhooksPage