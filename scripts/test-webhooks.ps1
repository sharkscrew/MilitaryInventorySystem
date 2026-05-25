# Demo: outgoing + incoming webhooks for defense presentation
$base = "http://127.0.0.1:8000/api"
$secret = "military-inventory-webhook-secret"

Write-Host "1. Health check..."
Invoke-RestMethod "$base/health" | ConvertTo-Json

Write-Host "`n2. List webhook events..."
Invoke-RestMethod "$base/webhooks/events" | ConvertTo-Json

Write-Host "`n3. Create subscription (uses webhook.site - replace URL in script for live demo)..."
$subBody = @{
    name = "Defense Demo Listener"
    target_url = "https://webhook.site/00000000-0000-0000-0000-000000000000"
    secret = "demo-webhook-secret-change-me-32"
    events = @("stock.low", "stock.transaction", "inventory.created")
    is_active = $true
} | ConvertTo-Json
Write-Host "POST /webhooks/subscriptions - update target_url to your webhook.site URL first."
# Invoke-RestMethod "$base/webhooks/subscriptions" -Method Post -Body $subBody -ContentType "application/json"

Write-Host "`n4. Incoming webhook (stock sync from procurement)..."
$payload = @{
    event = "procurement.stock_received"
    data = @{
        item_code = "UNI-002"
        quantity = 12
        personnel_name = "Supply Officer"
        remarks = "Demo incoming webhook"
    }
} | ConvertTo-Json -Depth 5
$bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
$hmac = New-Object System.Security.Cryptography.HMACSHA256
$hmac.Key = [System.Text.Encoding]::UTF8.GetBytes($secret)
$sig = [BitConverter]::ToString($hmac.ComputeHash($bytes)).Replace("-", "").ToLower()

try {
    $result = Invoke-RestMethod "$base/webhooks/incoming" -Method Post -Body $payload -ContentType "application/json" -Headers @{ "X-Webhook-Signature" = $sig }
    $result | ConvertTo-Json -Depth 5
} catch {
    Write-Host $_.Exception.Message
}

Write-Host "`n5. Recent webhook deliveries..."
Invoke-RestMethod "$base/webhooks/deliveries" | ConvertTo-Json -Depth 6

Write-Host "`nDone. For outgoing demo: set a real webhook.site URL, uncomment step 3, then POST a stock issue on UNI-002."
