# HƯỚNG DẪN IMPORT DỮ LIỆU VÀO DATABASE

## Tự động (Khuyên dùng)

### Cách 1: Sử dụng script PowerShell
```powershell
# Sau khi containers đã chạy và migrations hoàn tất
.\import-data-simple.ps1
```

### Cách 2: Import thủ công
```powershell
# Bước 1: Kiểm tra containers đang chạy
docker-compose ps

# Bước 2: Kiểm tra migrations đã chạy (phải có 22 tables)
docker exec ecom_mysql mysql -u ecomuser -pecompassword ecom -e "SHOW TABLES;"

# Bước 3: Disable foreign key checks và import
docker exec ecom_mysql mysql -u ecomuser -pecompassword ecom -e "SET FOREIGN_KEY_CHECKS=0; SOURCE /tmp/ecom.sql; SET FOREIGN_KEY_CHECKS=1;"
```

## Thủ công qua MySQL Workbench hoặc phpMyAdmin

### Bước 1: Kết nối database
```
Host: localhost
Port: 3307
User: ecomuser
Password: ecompassword
Database: ecom
```

### Bước 2: Import file ecom.sql
1. Chọn database `ecom`
2. Vào phần Import
3. **Tắt "Enable foreign key checks"** (quan trọng!)
4. Chọn file `ecom.sql`
5. Nhấn Import

## Quy trình đúng (như XAMPP)

```
1. MySQL khởi động
2. Tạo database "ecom"
3. Chạy migrations (npx sequelize-cli db:migrate) → Tạo 22 tables
4. Import ecom.sql (với foreign key checks OFF) → Thêm dữ liệu
5. Xong!
```

## Xử lý lỗi

### Lỗi: "Table doesn't exist"
→ Chưa chạy migrations. Chạy:
```powershell
docker exec ecom_backend npx sequelize-cli db:migrate
```

### Lỗi: Foreign key constraint
→ Cần tắt foreign key checks. Sử dụng script import-data-simple.ps1

### Reset và làm lại
```powershell
# Xóa tất cả và bắt đầu lại
docker-compose down -v
docker-compose up -d
# Đợi 40 giây
.\import-data-simple.ps1
```
