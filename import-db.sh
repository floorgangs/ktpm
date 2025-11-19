#!/bin/bash
# Script tự động import dữ liệu sau khi migrations hoàn tất

echo "=== Bắt đầu import dữ liệu ==="

# Chờ MySQL khởi động hoàn toàn
sleep 10

# Chờ backend chạy migrations (tạo tables)
echo "Chờ backend tạo tables..."
for i in {1..60}; do
    TABLE_COUNT=$(mysql -h mysql -u ecomuser -pecompassword ecom -sN -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'ecom';" 2>/dev/null || echo "0")
    if [ "$TABLE_COUNT" -ge 22 ]; then
        echo "✓ Đã phát hiện $TABLE_COUNT tables"
        break
    fi
    echo "Đợi tables được tạo... ($i/60) - Hiện có: $TABLE_COUNT tables"
    sleep 5
done

# Kiểm tra xem có đủ tables chưa
TABLE_COUNT=$(mysql -h mysql -u ecomuser -pecompassword ecom -sN -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'ecom';" 2>/dev/null || echo "0")
if [ "$TABLE_COUNT" -lt 22 ]; then
    echo "✗ Lỗi: Không đủ tables (có $TABLE_COUNT, cần ít nhất 22)"
    exit 1
fi

# Kiểm tra xem đã có dữ liệu chưa
USER_COUNT=$(mysql -h mysql -u ecomuser -pecompassword ecom -sN -e "SELECT COUNT(*) FROM Users;" 2>/dev/null || echo "0")
if [ "$USER_COUNT" -gt 0 ]; then
    echo "✓ Database đã có dữ liệu ($USER_COUNT users), bỏ qua import"
    exit 0
fi

# Import dữ liệu
echo "Đang import dữ liệu từ ecom-fixed.sql..."
mysql -h mysql -u ecomuser -pecompassword ecom -e "SET FOREIGN_KEY_CHECKS=0; SOURCE /docker-entrypoint-initdb.d/ecom-fixed.sql; SET FOREIGN_KEY_CHECKS=1;" 2>&1

if [ $? -eq 0 ]; then
    echo "✓ Import dữ liệu thành công!"
    # Kiểm tra lại số lượng users
    USER_COUNT=$(mysql -h mysql -u ecomuser -pecompassword ecom -sN -e "SELECT COUNT(*) FROM Users;" 2>/dev/null)
    echo "✓ Đã import $USER_COUNT users"
else
    echo "✗ Lỗi khi import dữ liệu"
    exit 1
fi

echo "=== Hoàn tất import dữ liệu ==="
