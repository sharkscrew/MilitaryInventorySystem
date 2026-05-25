# Military Inventory System

Web-based inventory for a military supply unit in **Roxas City** (academic project).

| Layer | Tech | Folder |
|-------|------|--------|
| Frontend | React + Vite | `client/` |
| Backend | Laravel 12 | `server/` |
| Database | MySQL (XAMPP) | `military_inventory` |

## Quick start

1. Start **Apache** and **MySQL** in XAMPP.
2. Backend:

```powershell
cd server
composer install
copy .env.example .env
php artisan key:generate
..\scripts\setup-mysql.ps1
php artisan migrate:fresh --seed
php artisan serve
```

3. Frontend:

```powershell
cd client
npm install
npm run dev
```

4. Open http://localhost:5173

## Documentation

- [Backend API](docs/BACKEND_API.md)
- [Problems & solutions (printed paper)](docs/PROBLEMS_AND_SOLUTIONS.md)
- [Backend checklist](docs/BACKEND_CHECKLIST.md)
- [Interview notes template](docs/INTERVIEW_NOTES.md)
- [Postman collection](docs/Military_Inventory_API.postman_collection.json)

## Webhooks (Sir Villy)

- **Outgoing:** register URL in app → Webhooks tab, or `POST /api/webhooks/subscriptions`
- **Incoming:** `POST /api/webhooks/incoming` with `X-Webhook-Signature`
- Demo script: `scripts/test-webhooks.ps1`
