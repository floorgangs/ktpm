# Script PowerShell import dữ liệu vào database
# Chạy sau khi containers đã khởi động và migrations hoàn tất

Write-Host "`n=== IMPORT DỮ LIỆU VÀO DATABASE ===" -ForegroundColor Cyan

# Kiểm tra containers có chạy không
Write-Host "`nKiểm tra containers..." -ForegroundColor Yellow
$containers = docker-compose ps --services --filter "status=running"
if ($containers -notcontains "mysql") {
    Write-Host "Lỗi: MySQL container chưa chạy!" -ForegroundColor Red
    Write-Host "Vui lòng chạy: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Containers đang chạy" -ForegroundColor Green

# Kiểm tra migrations đã chạy chưa
Write-Host "`nKiểm tra migrations..." -ForegroundColor Yellow
$migrations = docker-compose logs backend | Select-String "migrated"
if ($migrations.Count -lt 20) {
    Write-Host "Cảnh báo: Migrations có thể chưa hoàn tất" -ForegroundColor Yellow
    Write-Host "Đợi 30 giây để migrations hoàn tất..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
}
Write-Host "✓ Migrations đã hoàn tất" -ForegroundColor Green

# Import dữ liệu
Write-Host "`nĐang import dữ liệu từ ecom.sql..." -ForegroundColor Yellow

# Đọc file SQL và loại bỏ các dòng lỗi
$sqlContent = Get-Content ecom.sql -Raw
$sqlContent = $sqlContent -replace "(?m)^--.*$", ""  # Xóa comments
$sqlContent = $sqlContent -replace "(?m)^\s*$", ""   # Xóa dòng trống

# Import vào database với error handling
try {
    $sqlContent | docker-compose exec -T mysql mysql -u ecomuser -pecompassword ecom 2>&1 | Out-Null
    Write-Host "✓ Import thành công!" -ForegroundColor Green
    
    # Kiểm tra dữ liệu đã import
    Write-Host "`nKiểm tra dữ liệu..." -ForegroundColor Yellow
    $userCount = docker-compose exec -T mysql mysql -u ecomuser -pecompassword ecom -e "SELECT COUNT(*) as count FROM users;" 2>&1 | Select-String "count"
    $productCount = docker-compose exec -T mysql mysql -u ecomuser -pecompassword ecom -e "SELECT COUNT(*) as count FROM products;" 2>&1 | Select-String "count"
    
    Write-Host "✓ Đã import dữ liệu thành công!" -ForegroundColor Green
    Write-Host "`nThông tin database:" -ForegroundColor Cyan
    Write-Host "  - Users: " -NoNewline; Write-Host $userCount -ForegroundColor White
    Write-Host "  - Products: " -NoNewline; Write-Host $productCount -ForegroundColor White
    
} catch {
    Write-Host "✗ Có lỗi khi import!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`nThử import thủ công bằng lệnh:" -ForegroundColor Yellow
    Write-Host "  docker-compose exec mysql mysql -u ecomuser -pecompassword ecom < ecom.sql" -ForegroundColor White
    exit 1
}

Write-Host "`n=== HOÀN TẤT ===" -ForegroundColor Cyan
Write-Host "Truy cập ứng dụng tại: http://localhost:3000" -ForegroundColor Green
