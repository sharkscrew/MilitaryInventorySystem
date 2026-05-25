# Military Inventory System — Roxas City (Academic Project)

**Small business / unit:** Military Inventory System (supply and inventory unit — Roxas City)  
**Stack:** React (frontend) · Laravel (backend) · MySQL (database)  
**Prepared for:** Printed paper submission and capstone/thesis practice

---

## Problems identified (use as bullet points on printed paper)

- **Manual record-keeping** — Stock is tracked on paper ledgers or spreadsheets, which leads to lost records, duplicate entries, and slow lookups during issue or return.
- **No real-time stock visibility** — Officers cannot quickly see current quantity by category (uniforms, equipment, supplies) without physically checking the warehouse or armory.
- **Late low-stock awareness** — Reorder happens only after items run out during training or operations because there is no automatic alert when quantity falls at or below the reorder level.
- **Weak audit trail** — It is difficult to prove who received or returned an item, when it happened, and what balance remained after each movement.
- **Slow reporting for command** — Summary counts (total items, low stock, recent movements) require manual compilation instead of one dashboard view.
- **No integration with external systems** — Procurement or partner systems cannot push stock updates into inventory automatically; everything is re-keyed by hand.
- **No event-driven notifications** — When stock changes or hits critical levels, responsible personnel are not notified through automated channels (webhooks to monitoring tools).

---

## Solutions (printed paper + implemented in the web application)

| Problem | Solution (paper) | Solution in the app |
|--------|------------------|---------------------|
| Manual record-keeping | Centralized digital inventory in MySQL with structured item codes and categories | `inventory_items`, `categories` tables; REST API CRUD |
| No real-time visibility | Web dashboard showing stock by category and status | `GET /api/dashboard`, item list with filters |
| Late low-stock awareness | Reorder level per item; status `low_stock` / `out_of_stock` | `reorder_level`, `refreshStatus()` on each transaction |
| Weak audit trail | Log every receive, issue, return, and adjustment with personnel name | `stock_transactions` table; `POST /api/stock-transactions` |
| Slow reporting | One API call for totals, low stock count, and recent activity | `GET /api/dashboard` |
| No external integration | **Incoming webhook** — signed POST to update stock from procurement | `POST /api/webhooks/incoming` + `X-Webhook-Signature` (HMAC-SHA256) |
| No event notifications | **Outgoing webhooks** — system pushes events to registered URLs | Subscriptions + `WebhookService` on create/update/delete/low stock |

---

## Webhooks (Sir Villy requirement)

### Outgoing webhooks (Laravel → external URL)

When inventory changes, the API POSTs JSON to each active subscription that listens to that event.

**Events:** `inventory.created`, `inventory.updated`, `inventory.deleted`, `stock.low`, `stock.transaction`

**Headers:**

- `Content-Type: application/json`
- `X-Webhook-Event: stock.low`
- `X-Webhook-Signature: <hmac_sha256_of_body_using_subscription_secret>`

**Manage subscriptions:** `GET/POST/PUT/DELETE /api/webhooks/subscriptions`  
**View delivery log:** `GET /api/webhooks/deliveries`

### Incoming webhook (external → Laravel)

Procurement or another system sends stock updates to:

`POST /api/webhooks/incoming`

**Body example:**

```json
{
  "event": "procurement.stock_received",
  "data": {
    "item_code": "UNI-001",
    "quantity": 50,
    "personnel_name": "Supply Officer",
    "remarks": "Delivery from vendor"
  }
}
```

**Header:** `X-Webhook-Signature` = HMAC-SHA256 of raw JSON body using `WEBHOOK_INCOMING_SECRET` from `.env`.

---

## Interview note (for your documentation)

Before development, obtain permission from the person in charge. Record:

- Name of unit/business: **Military Inventory System**
- Location: **Roxas City, Capiz**
- Interviewee name and position
- Date of interview
- Confirmed pain points (map to bullet list above)
