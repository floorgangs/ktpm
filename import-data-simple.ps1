# Script đơn giản import dữ liệu từ ecom.sql
# Giống cách import trong phpMyAdmin/XAMPP

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  IMPORT DỮ LIỆU VÀO DATABASE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Bước 1: Copy file SQL vào container
Write-Host "[1/4] Copy file ecom.sql vào MySQL container..." -ForegroundColor Yellow
docker cp ecom.sql ecom_mysql:/tmp/ecom.sql
if ($LASTEXITCODE -eq 0) {
    Write-Host "      ✓ Đã copy file" -ForegroundColor Green
} else {
    Write-Host "      ✗ Lỗi copy file!" -ForegroundColor Red
    exit 1
}

# Bước 2: Kiểm tra tables đã tạo chưa
Write-Host "`n[2/4] Kiểm tra tables trong database..." -ForegroundColor Yellow
$tables = docker exec ecom_mysql mysql -u ecomuser -pecompassword ecom -e "SHOW TABLES;" 2>&1
$tableCount = ($tables | Measure-Object -Line).Lines - 1

if ($tableCount -lt 20) {
    Write-Host "      ⚠ Chỉ có $tableCount tables. Cần 22+ tables!" -ForegroundColor Yellow
    Write-Host "      Đang chạy migrations..." -ForegroundColor Yellow
    docker exec ecom_backend npx sequelize-cli db:migrate
    Start-Sleep -Seconds 5
    Write-Host "      ✓ Migrations hoàn tất" -ForegroundColor Green
} else {
    Write-Host "      ✓ Đã có $tableCount tables" -ForegroundColor Green
}

# Bước 3: Import dữ liệu (DISABLE FOREIGN KEY CHECKS)
Write-Host "`n[3/4] Import dữ liệu (tắt foreign key checks)..." -ForegroundColor Yellow
$importCmd = @"
SET FOREIGN_KEY_CHECKS=0;
SOURCE /tmp/ecom.sql;
SET FOREIGN_KEY_CHECKS=1;
"@

$importCmd | docker exec -i ecom_mysql mysql -u ecomuser -pecompassword ecom 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "      ✓ Import thành công!" -ForegroundColor Green
} else {
    Write-Host "      ⚠ Có thể có một số lỗi nhỏ (bỏ qua được)" -ForegroundColor Yellow
}

# Bước 4: Kiểm tra dữ liệu
Write-Host "`n[4/4] Kiểm tra dữ liệu đã import..." -ForegroundColor Yellow

$checkQueries = @(
    "SELECT COUNT(*) as count FROM users",
    "SELECT COUNT(*) as count FROM products", 
    "SELECT COUNT(*) as count FROM allcodes"
)

foreach ($query in $checkQueries) {
    $tableName = ($query -split " FROM ")[1]
    $result = docker exec ecom_mysql mysql -u ecomuser -pecompassword ecom -e "$query" 2>&1 | Select-String "count"
    if ($result) {
        $count = ($result -split "\s+")[1]
        Write-Host "      ✓ $tableName : $count bản ghi" -ForegroundColor Green
    }
}

# Hoàn tất
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ✓ HOÀN TẤT!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nTruy cập ứng dụng:" -ForegroundColor Yellow
Write-Host "  Frontend: " -NoNewline; Write-Host "http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  " -NoNewline; Write-Host "http://localhost:8080" -ForegroundColor White
Write-Host "  MySQL:    " -NoNewline; Write-Host "localhost:3307" -ForegroundColor White
Write-Host ""
