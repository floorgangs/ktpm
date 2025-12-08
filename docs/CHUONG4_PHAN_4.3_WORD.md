# 4.3 PHÂN TÍCH KHUNG NHÌN AGILE VÀ CI/CD

## 4.3.1 Tổng quan về CI/CD

### 4.3.1.1 Khái niệm

**CI (Continuous Integration)** - Tích hợp liên tục: Là phương pháp phát triển phần mềm trong đó các thành viên trong nhóm tích hợp code của họ thường xuyên, mỗi lần tích hợp được xác minh bằng các bài test tự động.

**CD (Continuous Delivery/Deployment)** - Triển khai liên tục: Là phần mở rộng của CI, tự động hóa việc triển khai ứng dụng đến môi trường staging hoặc production.

### 4.3.1.2 Lợi ích của CI/CD trong kiểm thử

| Lợi ích | Mô tả |
|---------|-------|
| Phát hiện lỗi sớm | Lỗi được phát hiện ngay khi code được push |
| Tự động hóa | Giảm công việc thủ công, tăng hiệu quả |
| Phản hồi nhanh | Developer nhận feedback trong vài phút |
| Đảm bảo chất lượng | Mọi thay đổi đều phải pass test mới được merge |
| Lịch sử rõ ràng | Theo dõi được ai thay đổi gì, khi nào |

---

## 4.3.2 Công cụ CI/CD: GitHub Actions

### 4.3.2.1 Giới thiệu GitHub Actions

GitHub Actions là nền tảng CI/CD được tích hợp trực tiếp vào GitHub, cho phép tự động hóa quy trình build, test và deploy.

**Ưu điểm:**
- Tích hợp sẵn với GitHub repository
- Miễn phí cho public repositories
- Cấu hình đơn giản bằng file YAML
- Hỗ trợ nhiều hệ điều hành (Ubuntu, Windows, macOS)
- Marketplace với hàng ngàn actions có sẵn

### 4.3.2.2 Cấu trúc GitHub Actions

```
.github/
└── workflows/
    ├── backend-ci.yml      # CI/CD cho Backend
    └── frontend-ci.yml     # CI/CD cho Frontend
```

**Các thành phần chính:**

| Thành phần | Mô tả |
|------------|-------|
| Workflow | File YAML định nghĩa quy trình tự động |
| Event | Sự kiện kích hoạt workflow (push, pull_request...) |
| Job | Một tập hợp các steps chạy trên cùng runner |
| Step | Một tác vụ đơn lẻ trong job |
| Action | Một ứng dụng có thể tái sử dụng |

---

## 4.3.3 Pipeline CI/CD của dự án

### 4.3.3.1 Sơ đồ tổng quan Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                      CI/CD PIPELINE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   [Developer Push Code]                                          │
│            │                                                     │
│            ▼                                                     │
│   ┌─────────────────┐                                           │
│   │  GitHub Trigger │ ◄── Event: push to main/develop           │
│   └────────┬────────┘                                           │
│            │                                                     │
│            ▼                                                     │
│   ┌─────────────────────────────────────────────┐               │
│   │              BACKEND PIPELINE                │               │
│   ├─────────────────────────────────────────────┤               │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────────┐ │               │
│   │  │  Lint   │─▶│  Test   │─▶│  Security   │ │               │
│   │  │ (ESLint)│  │ (Jest)  │  │  (npm audit)│ │               │
│   │  └─────────┘  └─────────┘  └─────────────┘ │               │
│   │                    │                        │               │
│   │                    ▼                        │               │
│   │            ┌─────────────┐                  │               │
│   │            │   Build     │                  │               │
│   │            │  (Docker)   │                  │               │
│   │            └─────────────┘                  │               │
│   └─────────────────────────────────────────────┘               │
│                                                                  │
│   ┌─────────────────────────────────────────────┐               │
│   │             FRONTEND PIPELINE                │               │
│   ├─────────────────────────────────────────────┤               │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────────┐ │               │
│   │  │  Lint   │─▶│  Test   │─▶│   Build     │ │               │
│   │  │         │  │ (Jest)  │  │ (npm build) │ │               │
│   │  └─────────┘  └─────────┘  └─────────────┘ │               │
│   └─────────────────────────────────────────────┘               │
│                                                                  │
│            │                                                     │
│            ▼                                                     │
│   ┌─────────────────┐                                           │
│   │  Pass/Fail      │                                           │
│   │  Notification   │──▶ GitHub Status / Auto Create Issue      │
│   └─────────────────┘                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3.3.2 Backend CI/CD Workflow

**File: `.github/workflows/backend-ci.yml`**

**Events trigger:**
```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
```

**Các jobs trong workflow:**

| Job | Mô tả | Dependencies |
|-----|-------|--------------|
| test | Chạy unit test và integration test | - |
| security-scan | Kiểm tra lỗ hổng bảo mật | - |
| build | Build Docker image | test, security-scan |
| create-issue-on-failure | Tạo issue khi test fail | test |

**Chi tiết job "test":**

| Step | Mô tả | Command |
|------|-------|---------|
| 1. Checkout | Clone source code | `actions/checkout@v3` |
| 2. Setup Node.js | Cài đặt Node.js 18 | `actions/setup-node@v3` |
| 3. Install dependencies | Cài đặt packages | `npm ci` |
| 4. Run linter | Kiểm tra code style | `npm run lint` |
| 5. Run unit tests | Chạy unit test | `npm run test:unit` |
| 6. Run integration tests | Chạy integration test | `npm run test:integration` |
| 7. Upload coverage | Upload báo cáo coverage | `codecov/codecov-action@v3` |

### 4.3.3.3 Frontend CI/CD Workflow

**File: `.github/workflows/frontend-ci.yml`**

**Các jobs trong workflow:**

| Job | Mô tả | Dependencies |
|-----|-------|--------------|
| test | Chạy lint, test và build | - |
| create-issue-on-failure | Tạo issue khi fail | test |

**Chi tiết job "test":**

| Step | Mô tả | Command |
|------|-------|---------|
| 1. Checkout | Clone source code | `actions/checkout@v3` |
| 2. Setup Node.js | Cài đặt Node.js 18 | `actions/setup-node@v3` |
| 3. Install dependencies | Cài đặt packages | `npm ci` |
| 4. Run linter | Kiểm tra code style | `npm run lint` |
| 5. Run unit tests | Chạy test với coverage | `npm test -- --coverage` |
| 6. Build production | Build ứng dụng | `npm run build` |
| 7. Upload artifacts | Lưu build artifacts | `actions/upload-artifact@v4` |

---

## 4.3.4 Tích hợp MySQL trong CI/CD

### 4.3.4.1 Service Container

GitHub Actions hỗ trợ chạy service containers để test với database thực.

```yaml
services:
  mysql:
    image: mysql:8.0
    env:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: ecom_test
    ports:
      - 3306:3306
    options: >-
      --health-cmd="mysqladmin ping"
      --health-interval=10s
      --health-timeout=5s
      --health-retries=3
```

**Giải thích:**
- `image: mysql:8.0`: Sử dụng MySQL phiên bản 8.0
- `health-cmd`: Kiểm tra MySQL đã sẵn sàng chưa
- `health-interval`: Kiểm tra mỗi 10 giây
- `health-retries`: Thử tối đa 3 lần

---

## 4.3.5 Tự động tạo Issue khi Test Fail

### 4.3.5.1 Mục đích

Khi CI/CD pipeline fail, hệ thống tự động tạo GitHub Issue để:
- Thông báo cho team về lỗi
- Tracking vấn đề cần fix
- Ghi lại lịch sử các lần fail

### 4.3.5.2 Cấu hình

```yaml
create-issue-on-failure:
  name: Create Issue if Tests Failed
  runs-on: ubuntu-latest
  needs: test
  if: failure()
  permissions:
    issues: write
    contents: read

  steps:
    - name: Create GitHub Issue
      uses: actions/github-script@v7
      with:
        script: |
          const issue = await github.rest.issues.create({
            owner: context.repo.owner,
            repo: context.repo.repo,
            title: `❌ Tests Failed - ${new Date().toLocaleString()}`,
            body: `## Test Failure Report
            **Branch:** ${context.ref}
            **Author:** ${context.actor}
            **Details:** [View Workflow](${context.server_url}/...)`,
            labels: ['bug', 'ci-failure']
          });
```

---

## 4.3.6 Kết quả triển khai CI/CD

### 4.3.6.1 Thống kê

| Metric | Giá trị |
|--------|---------|
| Tổng số workflows | 2 (Backend + Frontend) |
| Tổng số jobs | 6 |
| Thời gian chạy trung bình | ~2-3 phút |
| Tỷ lệ pass | 100% (sau khi fix) |

### 4.3.6.2 Screenshot kết quả

*(Chèn screenshot GitHub Actions ở đây)*

- Hình 4.1: Backend CI/CD workflow pass
- Hình 4.2: Frontend CI/CD workflow pass
- Hình 4.3: Code coverage report

### 4.3.6.3 Kết luận

Việc triển khai CI/CD với GitHub Actions đã mang lại các lợi ích:

1. **Tự động hóa hoàn toàn**: Mọi thay đổi code đều được test tự động
2. **Phản hồi nhanh**: Kết quả test có trong 2-3 phút
3. **Đảm bảo chất lượng**: Code phải pass 27 test cases mới được merge
4. **Tracking issues**: Tự động tạo issue khi có lỗi
5. **Tích hợp database**: Test với MySQL thực trong CI environment

> **Ghi chú**: Chi tiết cấu hình workflow xem tại **Phụ lục B - CI/CD Configuration**.

---

*Kết thúc phần 4.3*
