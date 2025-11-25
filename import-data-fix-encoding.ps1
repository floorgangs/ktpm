# Import data with correct UTF-8 encoding
Write-Host "Step 1: Copy SQL file to container..."
docker cp ecom-fixed.sql ecom_mysql:/tmp/ecom-import.sql

Write-Host "Step 2: Import data with UTF-8..."
docker exec ecom_mysql bash -c "mysql -u ecomuser -pecompassword --default-character-set=utf8mb4 ecom < /tmp/ecom-import.sql"

Write-Host "Step 3: Check product count..."
docker exec ecom_mysql mysql -u ecomuser -pecompassword --default-character-set=utf8mb4 ecom -e "SELECT COUNT(*) as total FROM Products;"

Write-Host "Step 4: Show sample product names..."
docker exec ecom_mysql mysql -u ecomuser -pecompassword --default-character-set=utf8mb4 ecom -e "SELECT id, name FROM Products LIMIT 3;"

Write-Host "`nDone! Please check the website at http://localhost:3000"
