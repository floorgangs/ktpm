#!/bin/bash
# Script tự động import data sau khi migrations chạy xong

echo "Đợi MySQL sẵn sàng..."
sleep 10

echo "Đợi backend chạy migrations..."
sleep 30

echo "Import dữ liệu từ ecom.sql..."
docker-compose exec -T mysql mysql -u ecomuser -pecompassword ecom < ecom.sql

echo "Import hoàn tất!"
