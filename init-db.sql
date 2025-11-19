-- Script khởi tạo database cho Docker
-- File này sẽ được chạy tự động khi MySQL container được tạo lần đầu

-- Set UTF-8 encoding
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
ALTER DATABASE ecom CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

USE ecom;

-- Note: Migrations sẽ tạo tables tự động qua backend
-- Dữ liệu sẽ được import tự động sau khi tables được tạo
