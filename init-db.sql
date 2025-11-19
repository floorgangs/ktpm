-- Script khởi tạo database cho Docker
-- File này sẽ được chạy tự động khi MySQL container được tạo lần đầu

-- Set UTF-8 encoding
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
ALTER DATABASE ecom CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

USE ecom;

-- Chờ backend chạy migrations để tạo tables
-- Sau đó import data từ ecom.sql
