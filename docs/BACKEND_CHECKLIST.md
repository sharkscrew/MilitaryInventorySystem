# Backend deliverables checklist (your part)

**Student role:** Backend (Laravel + MySQL + Webhooks)  
**Project:** Military Inventory System — Roxas City

## Required — all complete

- [x] Laravel REST API under `server/`
- [x] MySQL database `military_inventory` (see `server/.env`)
- [x] Migrations: categories, inventory_items, stock_transactions, webhooks
- [x] Seed sample data (`php artisan db:seed`)
- [x] Dashboard API (`GET /api/dashboard`)
- [x] Inventory CRUD + stock transactions
- [x] **Outgoing webhooks** (subscriptions, HMAC signature, delivery log)
- [x] **Incoming webhook** (`POST /api/webhooks/incoming`)
- [x] CORS for React (`config/cors.php`)
- [x] API documentation (`docs/BACKEND_API.md`)
- [x] Postman collection (`docs/Military_Inventory_API.postman_collection.json`)
- [x] Problems/solutions for paper (`docs/PROBLEMS_AND_SOLUTIONS.md`)
- [x] Setup scripts (`scripts/setup-mysql.ps1`, `scripts/test-webhooks.ps1`)
- [x] Feature tests (`php artisan test`)
- [x] React demo UI wired to API (for defense demo)

## Group tasks (not only backend)

- [ ] Interview permission + fill in `docs/INTERVIEW_NOTES.md`
- [ ] Print problems/solutions paper
- [ ] Defense rehearsal (webhook.site demo)

## Quick verify before submission

```powershell
cd server
php artisan test
php artisan serve
# other terminal: ..\scripts\test-webhooks.ps1
```
