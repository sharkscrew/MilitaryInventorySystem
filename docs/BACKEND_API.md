# Backend API — For frontend teammates

Base URL (local): `http://127.0.0.1:8000/api`

## Setup (XAMPP + MySQL)

1. Create database: `military_inventory`
2. Copy `server/.env.example` → `server/.env`
3. Set `DB_*` and run:

```bash
cd server
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

API runs at `http://127.0.0.1:8000`. React dev server: `http://localhost:5173` (CORS allowed).

## Main endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API status |
| GET | `/dashboard` | Summary stats + recent transactions + webhook log |
| GET/POST/PUT/DELETE | `/categories` | Categories |
| GET/POST/PUT/DELETE | `/inventory-items` | Items (`?search=&status=&category_id=`) |
| GET | `/inventory-items/{id}` | Item + recent transactions |
| GET/POST | `/stock-transactions` | Audit log / record movement |
| GET | `/webhooks/events` | List of webhook event names |
| GET/POST/PUT/DELETE | `/webhooks/subscriptions` | Outgoing webhook URLs |
| GET | `/webhooks/deliveries` | Webhook delivery history |
| POST | `/webhooks/incoming` | Incoming signed webhook (server-to-server) |

## Stock transaction body

```json
{
  "inventory_item_id": 1,
  "type": "issue",
  "quantity": 2,
  "personnel_name": "Cpl. Dela Cruz",
  "reference_no": "ISS-2026-001",
  "remarks": "Training detail"
}
```

Types: `receive`, `issue`, `return`, `adjustment`

## Frontend (implemented in `client/`)

Run both servers:

```bash
# Terminal 1
cd server && php artisan serve

# Terminal 2
cd client && npm run dev
```

Open http://localhost:5173 — pages: Dashboard, Inventory, Stock, Webhooks.

## Postman & scripts

- `docs/Military_Inventory_API.postman_collection.json`
- `scripts/setup-mysql.ps1` — create database
- `scripts/test-webhooks.ps1` — demo incoming webhook
