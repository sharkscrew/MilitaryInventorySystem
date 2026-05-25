# Creates MySQL database for Military Inventory System (XAMPP)
$mysql = "C:\xampp\mysql\bin\mysql.exe"
if (-not (Test-Path $mysql)) {
    Write-Error "XAMPP MySQL not found at $mysql. Start MySQL in XAMPP Control Panel first."
    exit 1
}

& $mysql -u root -e "CREATE DATABASE IF NOT EXISTS military_inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Could not connect to MySQL. Open XAMPP and start MySQL, then run this script again."
    exit 1
}

Write-Host "Database 'military_inventory' is ready."
Write-Host "Next: cd server; php artisan migrate:fresh --seed"
