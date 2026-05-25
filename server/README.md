# Military Inventory System — Laravel API

## Requirements

- PHP 8.2+ (XAMPP)
- Composer
- MySQL (start **MySQL** in XAMPP Control Panel)

## Quick setup

```powershell
cd server
composer install
copy .env.example .env
php artisan key:generate
```

Create database (or run from project root):

```powershell
..\scripts\setup-mysql.ps1
php artisan migrate:fresh --seed
php artisan serve
```

API: `http://127.0.0.1:8000/api`

## Webhook demo

```powershell
..\scripts\test-webhooks.ps1
```

Or import `docs/Military_Inventory_API.postman_collection.json` into Postman.

## Environment

| Variable | Purpose |
|----------|---------|
| `DB_DATABASE` | `military_inventory` |
| `WEBHOOK_INCOMING_SECRET` | HMAC secret for `POST /api/webhooks/incoming` |
