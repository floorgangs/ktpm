# E-commerce Project - Docker Setup

## Hướng dẫn chạy dự án với Docker

### Yêu cầu
- Docker Desktop đã cài đặt
- Docker Compose v3.8 trở lên

### Các bước thực hiện

#### 1. Kiểm tra Docker
```bash
docker --version
docker-compose --version
```

#### 2. Build và chạy containers
```bash
# Di chuyển về thư mục root của dự án
cd D:\Kiemthuphanmem\kiemthuphanmem

# Build và start tất cả services (lần đầu tiên)
docker-compose up --build

# Hoặc chạy ở chế độ background
docker-compose up -d --build
```

#### 3. Chờ services khởi động
- MySQL: ~30 giây
- Backend API: ~40 giây (sau khi MySQL ready)
- Frontend: ~60 giây

#### 4. Truy cập ứng dụng
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **MySQL**: localhost:3307 (host machine)

### Các lệnh Docker hữu ích

```bash
# Xem logs tất cả services
docker-compose logs -f

# Xem logs của service cụ thể
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Kiểm tra trạng thái containers
docker-compose ps

# Dừng tất cả containers
docker-compose down

# Dừng và xóa volumes (xóa database)
docker-compose down -v

# Restart một service cụ thể
docker-compose restart backend
docker-compose restart frontend

# Rebuild một service cụ thể
docker-compose up -d --build backend

# Vào shell của container
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec mysql bash

# Chạy lệnh trong container
docker-compose exec backend npm run migrate
docker-compose exec backend npx sequelize-cli db:migrate

# Xem danh sách containers đang chạy
docker ps

# Xóa tất cả containers, images, volumes (reset hoàn toàn)
docker-compose down -v --rmi all
```

### Kết nối MySQL từ host machine
```
Host: localhost
Port: 3307
User: ecomuser
Password: ecompassword
Database: ecom
```

### Troubleshooting

#### Lỗi: Port already in use
```bash
# Kiểm tra port đang được sử dụng
netstat -ano | findstr :3000
netstat -ano | findstr :8080
netstat -ano | findstr :3307

# Dừng process hoặc thay đổi port trong docker-compose.yml
```

#### Lỗi: Database connection failed
```bash
# Kiểm tra MySQL container đã chạy chưa
docker-compose ps

# Xem logs MySQL
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql
```

#### Lỗi: Backend không kết nối được MySQL
```bash
# Chờ thêm thời gian cho MySQL khởi động
# Hoặc restart backend
docker-compose restart backend
```

#### Reset toàn bộ dự án
```bash
# Xóa tất cả containers, volumes, images
docker-compose down -v --rmi all

# Build lại từ đầu
docker-compose up --build
```

### Cấu trúc Docker

```
kiemthuphanmem/
├── docker-compose.yml          # Orchestration file
├── init-db.sql                 # Database initialization script
├── ecom.sql                    # Sample data for import
├── import-data.ps1             # Auto import script (Windows)
├── import-data.sh              # Auto import script (Linux/Mac)
├── ecomAPI/
│   ├── Dockerfile             # Backend image definition
│   ├── .dockerignore          # Files to exclude
│   └── .env.example           # Environment variables template
└── eCommerce_Reactjs/
    ├── Dockerfile             # Frontend image definition
    ├── .dockerignore          # Files to exclude
    └── .env.example           # Environment variables template
```

### Import dữ liệu mẫu

Sau khi containers đã chạy và migrations hoàn tất, import dữ liệu mẫu:

#### Windows (PowerShell):
```powershell
# Chạy script tự động
.\import-data.ps1

# Hoặc import thủ công
Get-Content ecom.sql | docker-compose exec -T mysql mysql -u ecomuser -pecompassword ecom
```

#### Linux/Mac:
```bash
# Chạy script tự động
chmod +x import-data.sh
./import-data.sh

# Hoặc import thủ công
docker-compose exec -T mysql mysql -u ecomuser -pecompassword ecom < ecom.sql
```

### Lưu ý quan trọng

1. **Lần đầu chạy**: 
   - Database tables sẽ được tạo tự động qua migrations
   - Để import dữ liệu mẫu, chạy script `import-data.ps1` (Windows) hoặc `import-data.sh` (Linux/Mac)
2. **Environment variables**: Các biến môi trường đã được config sẵn trong `docker-compose.yml`
3. **Data persistence**: Database data được lưu trong Docker volume `mysql_data`
4. **Hot reload**: Frontend và Backend đều hỗ trợ hot reload khi code thay đổi
5. **Network**: Các services giao tiếp với nhau qua network `ecom_network`
6. **Auto migrations**: Backend tự động chạy migrations khi khởi động

### Development vs Production

#### Development (hiện tại)
- Source code được mount vào container
- Hot reload enabled
- Logs verbose

#### Production (cần cấu hình thêm)
- Build optimized images
- Use environment-specific configs
- Setup reverse proxy (nginx)
- Enable HTTPS
- Use secrets management

### Cấu hình nâng cao

#### Thay đổi port
Sửa file `docker-compose.yml`:
```yaml
services:
  frontend:
    ports:
      - "3001:3000"  # Thay đổi port frontend
  backend:
    ports:
      - "8081:8080"  # Thay đổi port backend
  mysql:
    ports:
      - "3308:3306"  # Thay đổi port MySQL
```

#### Thêm environment variables
Sửa file `docker-compose.yml` trong section `environment` của service tương ứng.

### Support
Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs: `docker-compose logs -f`
2. Kiểm tra trạng thái: `docker-compose ps`
3. Reset và thử lại: `docker-compose down -v && docker-compose up --build`
