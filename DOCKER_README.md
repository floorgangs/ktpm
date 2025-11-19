# E-commerce Project - Docker Setup

## Hướng dẫn chạy dự án với Docker

### Yêu cầu
- Docker Desktop đã cài đặt
- Docker Compose v3.8 trở lên

### Các bước thực hiện (CHỈ CẦN 2 LỆNH!)

#### 1. Clone repository và chạy Docker
```bash
# Clone về
git clone https://github.com/TranNam283/kiemthuphanmem.git
cd kiemthuphanmem

# Chạy Docker (TỰ ĐỘNG import dữ liệu)
docker-compose up -d --build
```

#### 2. Chờ services khởi động và tự động import dữ liệu
- MySQL: ~30 giây
- Backend API: ~40 giây (tự động chạy migrations)
- **Data Importer: ~60-90 giây** (TỰ ĐỘNG import dữ liệu)
- Frontend: ~60 giây

**✓ Dữ liệu sẽ được import TỰ ĐỘNG sau khi migrations hoàn tất!**

#### 3. Truy cập ứng dụng
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **MySQL**: localhost:3307 (host machine)

### Kiểm tra quá trình import dữ liệu

```bash
# Xem logs của data importer
docker-compose logs data-importer

# Kiểm tra dữ liệu đã import chưa
docker exec ecom_mysql mysql -u ecomuser -pecompassword ecom -e "SELECT COUNT(*) as total_users FROM Users;"
```

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
├── docker-compose.yml          # Orchestration file (4 services)
├── init-db.sql                 # Database initialization script
├── ecom-fixed.sql              # Dữ liệu mẫu (TỰ ĐỘNG import)
├── import-db.sh                # Script import tự động trong container
├── ecomAPI/
│   ├── Dockerfile             # Backend image definition
│   └── src/                   # Source code
└── eCommerce_Reactjs/
    ├── Dockerfile             # Frontend image definition
    └── src/                   # Source code
```

### Cách hoạt động của Auto Import

1. **MySQL khởi động** → Tạo database `ecom`
2. **Backend khởi động** → Chạy migrations (tạo 22 tables)
3. **Data Importer khởi động** → Tự động:
   - Chờ backend tạo đủ tables (≥22 tables)
   - Kiểm tra xem đã có dữ liệu chưa
   - Nếu chưa có → Import `ecom-fixed.sql` tự động
   - Nếu đã có → Bỏ qua (không import lại)
4. **Frontend khởi động** → Hoàn tất!

**✓ KHÔNG cần chạy thêm script import nào nữa!**

### Lưu ý quan trọng

1. **Import tự động**: 
   - ✓ Dữ liệu tự động import lần đầu chạy
   - ✓ Không cần chạy script import thủ công
   - ✓ Nếu đã có dữ liệu, sẽ tự động bỏ qua
2. **Environment variables**: Các biến môi trường đã được config sẵn trong `docker-compose.yml`
3. **Data persistence**: Database data được lưu trong Docker volume `mysql_data`
4. **Hot reload**: Frontend và Backend đều hỗ trợ hot reload khi code thay đổi
5. **Network**: Các services giao tiếp với nhau qua network `ecom_network`
6. **Auto migrations**: Backend tự động chạy migrations khi khởi động

### Reset và chạy lại từ đầu

```bash
# Xóa tất cả (bao gồm database)
docker-compose down -v

# Chạy lại - dữ liệu sẽ TỰ ĐỘNG import lại
docker-compose up -d --build
```

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
