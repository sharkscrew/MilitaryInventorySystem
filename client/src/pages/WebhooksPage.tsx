import { useEffect, useState } from 'react'
import {
  api,
  type Paginated,
  type WebhookDelivery,
  type WebhookSubscription,
} from '../api'

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

  useEffect(() => {
    load()
  }, [])

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    setError('')
    const form = new FormData(e.currentTarget)
    const selected = form.getAll('events') as string[]
    try {
      await api.post('/webhooks/subscriptions', {
        name: form.get('name'),
        target_url: form.get('target_url'),
        secret: form.get('secret'),
        events: selected.length ? selected : events,
        is_active: true,
      })
      setMessage('Subscription saved. Outgoing webhooks will POST to your URL with X-Webhook-Signature.')
      e.currentTarget.reset()
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save subscription')
    }
  }

  return (
    <div className="page">
      <h2>Webhooks</h2>
      <p className="muted">
        Outgoing: Laravel notifies external URLs on inventory/stock events (HMAC signature).
        Incoming: <code>POST /api/webhooks/incoming</code> for procurement sync.
      </p>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <section className="panel">
        <h3>Available events</h3>
        <ul className="tag-list">
          {events.map((ev) => (
            <li key={ev}>{ev}</li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h3>Register outgoing webhook</h3>
        <p className="muted">Use your URL from webhook.site for the defense demo.</p>
        <form className="form-grid" onSubmit={handleSubscribe}>
          <label>
            Name
            <input name="name" required placeholder="Slack / webhook.site" />
          </label>
          <label className="full">
            Target URL
            <input name="target_url" type="url" required placeholder="https://webhook.site/..." />
          </label>
          <label className="full">
            Secret (min 16 chars)
            <input name="secret" required defaultValue="demo-webhook-secret-change-me-32" />
          </label>
          <fieldset className="full">
            <legend>Events</legend>
            {events.map((ev) => (
              <label key={ev} className="checkbox">
                <input type="checkbox" name="events" value={ev} defaultChecked />
                {ev}
              </label>
            ))}
          </fieldset>
          <button type="submit">Save subscription</button>
        </form>
      </section>

      <section className="panel">
        <h3>Active subscriptions</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>URL</th>
              <th>Events</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td className="truncate">{s.target_url}</td>
                <td>{s.events.join(', ')}</td>
                <td>{s.is_active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h3>Delivery log (proof for Sir Villy)</h3>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Direction</th>
              <th>Event</th>
              <th>Success</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d) => (
              <tr key={d.id}>
                <td>{new Date(d.created_at).toLocaleString()}</td>
                <td>{d.direction}</td>
                <td>{d.event}</td>
                <td>{d.success ? '✓' : '✗'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
