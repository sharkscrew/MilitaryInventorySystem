import { useEffect, useState } from 'react'
import { api, type Paginated, type WebhookDelivery, type WebhookSubscription } from '../api'

// ─── DELIVERY STATUS BADGE ────────────────────────────────────────────────────
// ↓ Change success/failure badge colors here
function DeliveryBadge({ success }: { success: boolean }) {
  return success ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      ✓ Success
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
      ✗ Failed
    </span>
  )
}

// ─── DIRECTION BADGE ──────────────────────────────────────────────────────────
function DirectionBadge({ direction }: { direction: string }) {
  // ↓ Change direction badge colors here
  const style = direction === 'outgoing'
    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
    : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {direction}
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
function Input({ name, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { name: string }) {
  return (
    // ↓ Change input style here
    <input
      name={name}
      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
      {...props}
    />
  )
}

function Label({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs text-white/40 font-medium uppercase tracking-wide">{label}</span>
      {children}
    </label>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export function WebhooksPage() {
  const [events, setEvents] = useState<string[]>([])
  const [subscriptions, setSubscriptions] = useState<WebhookSubscription[]>([])
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = () => {
    Promise.all([
      api.get<{ events: string[] }>('/webhooks/events'),
      api.get<WebhookSubscription[]>('/webhooks/subscriptions'),
      api.get<Paginated<WebhookDelivery>>('/webhooks/deliveries'),
    ])
      .then(([ev, subs, del]) => {
        setEvents(ev.events)
        setSubscriptions(subs)
        setDeliveries(del.data)
      })
      .catch((e: Error) => setError(e.message))
  }

  useEffect(() => { load() }, [])

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    setError('')
    const form = new FormData(e.currentTarget)
    const selected = form.getAll('events') as string[]
    try {
      await api.post('/webhooks/subscriptions', {
        name:       form.get('name'),
        target_url: form.get('target_url'),
        secret:     form.get('secret'),
        events:     selected.length ? selected : events,
        is_active:  true,
      })
      setMessage('Subscription saved. Outgoing webhooks will POST to your URL with X-Webhook-Signature.')
      e.currentTarget.reset()
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save subscription')
    }
  }

  return (
    // ↓ Change page max-width and outer padding here
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Webhooks</h1>
        {/* ↓ Change subtitle text here */}
        <p className="text-sm text-white/30 mt-1">
          Outgoing: Laravel notifies external URLs on inventory/stock events (HMAC signature).
          Incoming: <code className="font-mono text-white/50">POST /api/webhooks/incoming</code> for procurement sync.
        </p>
      </div>

      {/* ── Toasts ───────────────────────────────────────────────────────── */}
      {message && <Toast message={message} type="success" />}
      {error   && <Toast message={error}   type="error"   />}

      {/* ── Available events ─────────────────────────────────────────────
          These are pulled from your API. No changes needed here unless
          you want to change how individual event tags look               */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-white mb-4">Available events</h2>
        <div className="flex flex-wrap gap-2">
          {events.map((ev) => (
            // ↓ Change event tag style here
            <span key={ev} className="px-3 py-1 rounded-xl text-xs font-mono bg-white/5 text-white/50 border border-white/10">
              {ev}
            </span>
          ))}
        </div>
      </div>

      {/* ── Register webhook form ─────────────────────────────────────────
          To add a new field: add a <Label> block here and include the
          field in handleSubscribe's api.post body above                   */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-white mb-1">Register outgoing webhook</h2>
        {/* ↓ Change the helper text here */}
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

          {/* ↓ Change checkbox list style here */}
          <div>
            <span className="text-xs text-white/40 font-medium uppercase tracking-wide block mb-2">Events</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {events.map((ev) => (
                <label key={ev} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="events"
                    value={ev}
                    defaultChecked
                    // ↓ Change checkbox accent color here (Tailwind accent-*)
                    className="accent-white w-3.5 h-3.5"
                  />
                  <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors font-mono">
                    {ev}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* ↓ Change submit button style here */}
          <div className="pt-1">
            <button
              type="submit"
              className="bg-white text-black text-sm font-medium px-5 py-2 rounded-xl hover:bg-white/90 transition-colors"
            >
              Save subscription
            </button>
          </div>
        </form>
      </div>

      {/* ── Active subscriptions table ────────────────────────────────────
          To add a column: add <th> in thead and matching <td> in tbody   */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-white mb-4">Active subscriptions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-white/30 border-b border-white/5">
                <th className="pb-2 font-normal pr-4">Name</th>
                <th className="pb-2 font-normal pr-4">URL</th>
                <th className="pb-2 font-normal pr-4">Events</th>
                <th className="pb-2 font-normal">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-white/20 text-sm">
                    No subscriptions yet.
                  </td>
                </tr>
              )}
              {subscriptions.map((s) => (
                <tr key={s.id} className="text-white/60 hover:bg-white/[0.03] transition-colors">
                  <td className="py-2.5 pr-4 font-medium text-white/90">{s.name}</td>
                  <td className="py-2.5 pr-4 text-white/30 text-xs font-mono max-w-[200px] truncate">
                    {s.target_url}
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {s.events.map((ev) => (
                        <span key={ev} className="px-1.5 py-0.5 rounded text-xs font-mono bg-white/5 text-white/30">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5">
                    {/* ↓ Change active/inactive indicator style here */}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-white/5 text-white/30 border border-white/10'
                    }`}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Delivery log table ────────────────────────────────────────────
          This is the proof log for your defense (Sir Villy)
          To add more columns: add <th> and matching <td>                  */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-white mb-1">Delivery log</h2>
        {/* ↓ Change or remove this note text */}
        <p className="text-xs text-white/30 mb-4">Proof of outgoing webhook delivery for demo.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
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
                  <td colSpan={4} className="py-10 text-center text-white/20 text-sm">
                    No deliveries yet.
                  </td>
                </tr>
              )}
              {deliveries.map((d) => (
                <tr key={d.id} className="text-white/60 hover:bg-white/[0.03] transition-colors">
                  <td className="py-2.5 pr-4 text-white/30 whitespace-nowrap text-xs">
                    {new Date(d.created_at).toLocaleString('en-PH', {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="py-2.5 pr-4">
                    <DirectionBadge direction={d.direction} />
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-white/50">{d.event}</td>
                  <td className="py-2.5">
                    <DeliveryBadge success={d.success} />
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