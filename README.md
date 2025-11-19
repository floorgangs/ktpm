# E-Commerce Project - Full Stack Application

Dự án website thương mại điện tử sử dụng React.js + Node.js + MySQL.

##  Hướng dẫn chạy dự án với Docker (KHUYÊN DÙNG)

### Chỉ cần 2 lệnh:

```bash
# 1. Clone repository
git clone https://github.com/TranNam283/kiemthuphanmem.git
cd kiemthuphanmem

# 2. Chạy Docker (TỰ ĐỘNG import dữ liệu)
docker-compose up -d --build
```

### Chờ 2-3 phút và truy cập:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **MySQL**: localhost:3307

** Dữ liệu sẽ được import TỰ ĐỘNG - Không cần làm gì thêm!**

### Kiểm tra logs:
```bash
# Xem tất cả logs
docker-compose logs -f

# Xem quá trình import dữ liệu
docker-compose logs data-importer
```

### Reset và chạy lại:
```bash
# Xóa hết và chạy lại
docker-compose down -v
docker-compose up -d --build
```

---

##  Tài liệu chi tiết

- [DOCKER_README.md](DOCKER_README.md) - Hướng dẫn Docker chi tiết
- [IMPORT_GUIDE.md](IMPORT_GUIDE.md) - Hướng dẫn import dữ liệu thủ công (nếu cần)

##  Công nghệ sử dụng

- **Frontend**: React.js
- **Backend**: Node.js + Express.js
- **Database**: MySQL 8.0
- **ORM**: Sequelize
- **Containerization**: Docker + Docker Compose

##  Thành viên nhóm

[Thêm thông tin thành viên tại đây]

##  License

[Thêm thông tin license tại đây]
