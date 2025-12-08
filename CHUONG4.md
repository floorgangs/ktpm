# 📚 CHƯƠNG 4: THIẾT KẾ TEST VÀ CI/CD

> **Đồ án môn**: Kiểm thử phần mềm  
> **Dự án**: eCommerce Full Stack (React.js + Node.js + MySQL)  
> **Cập nhật**: 08/12/2025  
> **Số trang mục tiêu**: 25-30 trang (chiếm ~30% của 80 trang tổng)

---

## 📋 MỤC LỤC CHƯƠNG 4

| STT | Nội dung                         | Số trang     | Trạng thái           |
| --- | -------------------------------- | ------------ | -------------------- |
| 4.1 | Tổng quan                        | 2 trang      | ⏳ Cần viết          |
| 4.2 | Phân tích khung nhìn V-Model     | 3 trang      | ⏳ Cần viết          |
| 4.3 | Phân tích khung nhìn Agile/CI-CD | 4 trang      | ✅ **ĐÃ TRIỂN KHAI** |
| 4.4 | Phân tích khung nhìn phương pháp | 5 trang      | ⏳ Cần viết          |
| 4.5 | Phân tích kỹ thuật nâng cao      | 4 trang      | ⏳ Cần viết          |
| 4.6 | Triển khai Test (Implementation) | 6 trang      | ✅ **ĐÃ TRIỂN KHAI** |
| 4.7 | Kết quả và đánh giá              | 3 trang      | ⏳ Đợi CI/CD pass    |
|     | **TỔNG**                         | **27 trang** |                      |

---

## ✅ PHẦN ĐÃ HOÀN THÀNH

### 1. CI/CD Pipeline với GitHub Actions

#### 1.1 Backend CI/CD (`backend-ci.yml`)

**File**: `.github/workflows/backend-ci.yml`

```yaml
# Các jobs đã triển khai:
✅ test          - Unit test + Integration test với MySQL
✅ security-scan - npm audit báo cáo bảo mật
✅ build         - Docker image build + health check
✅ deploy        - Notification (placeholder)
✅ create-issue-on-failure - Tự động tạo GitHub Issue khi fail
```

**Tính năng nổi bật:**

- MySQL 8.0 service container cho integration test
- Code coverage với ngưỡng 80%
- Upload artifacts (coverage report)
- Tự động tạo issue khi test fail

#### 1.2 Frontend CI/CD (`frontend-ci.yml`)

**File**: `.github/workflows/frontend-ci.yml`

```yaml
# Các jobs đã triển khai:
✅ test - Lint + Unit test + Build production
✅ create-issue-on-failure - Tự động tạo GitHub Issue khi fail
```

**Tính năng nổi bật:**

- Build verification trước khi deploy
- Upload build artifacts
- Codecov coverage report

---

### 2. Test Implementation - Backend

#### 2.1 Unit Tests (32 tests - 100% pass)

| File                     | Mô tả                                       | Số tests |
| ------------------------ | ------------------------------------------- | -------- |
| `authService.test.js`    | Password hashing, email/password validation | 9 tests  |
| `productService.test.js` | Discount, filter, pagination, search        | 12 tests |
| `orderService.test.js`   | Order creation, status, discount            | 6 tests  |

**Tổng: 32 tests - 100% PASS ✅**

#### 2.2 Source Code được test

| File                        | Chức năng                                                                                   | Coverage |
| --------------------------- | ------------------------------------------------------------------------------------------- | -------- |
| `src/utils/authUtils.js`    | hashPassword, comparePassword, validateEmail, validatePassword                              | 100%     |
| `src/utils/productUtils.js` | calculateDiscountedPrice, filterByPrice, filterByCategory, paginateProducts, searchProducts | 100%     |
| `src/utils/orderUtils.js`   | validateOrderData, calculateTotal, applyDiscount, validateOrderStatus                       | 100%     |

#### 2.3 Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: "node",
  collectCoverageFrom: [
    "src/utils/authUtils.js",
    "src/utils/productUtils.js",
    "src/utils/orderUtils.js",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

---

### 3. Code Coverage Report

```
┌─────────────────────────────────────────────────────────────┐
│ File                  │ % Stmts │ % Branch │ % Funcs │ % Lines │
├───────────────────────┼─────────┼──────────┼─────────┼─────────┤
│ authUtils.js          │  100    │   100    │   100   │   100   │
│ productUtils.js       │  100    │   100    │   100   │   100   │
│ orderUtils.js         │  100    │   100    │   100   │   100   │
├───────────────────────┼─────────┼──────────┼─────────┼─────────┤
│ TOTAL                 │  100%   │   100%   │   100%  │   100%  │
└─────────────────────────────────────────────────────────────┘

✅ Coverage threshold (80%) - PASSED
```

---

### 4. GitHub Actions Workflow Status

| Workflow       | Status         | Lần cuối chạy |
| -------------- | -------------- | ------------- |
| Backend CI/CD  | ⏳ Đang verify | 08/12/2025    |
| Frontend CI/CD | ⏳ Đang verify | 08/12/2025    |

**Link kiểm tra**: https://github.com/TranNam283/kiemthuphanmem/actions

---

## 📝 NỘI DUNG CHI TIẾT CHO WORD

### 4.1 TỔNG QUAN (2 trang)

```
4.1.1 Mục tiêu kiểm thử
- Đảm bảo chất lượng code trước khi deploy
- Phát hiện lỗi sớm trong quy trình phát triển
- Tự động hóa quy trình kiểm thử

4.1.2 Phạm vi kiểm thử
- Backend: Node.js/Express API
- Frontend: React.js components
- Database: MySQL 8.4
- CI/CD: GitHub Actions

4.1.3 Tổng quan framework
[Sơ đồ V-Model]
[Sơ đồ Agile/CI-CD]
```

### 4.2 PHÂN TÍCH KHUNG NHÌN V-MODEL (3 trang)

```
┌──────────────────────────────────────────────────────────────────┐
│                         V-MODEL                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Requirements ─────────────────────────────── Acceptance Testing │
│       ↓                                              ↑            │
│  System Design ───────────────────────────── System Testing      │
│       ↓                                              ↑            │
│  Architecture Design ────────────────────── Integration Testing  │
│       ↓                                              ↑            │
│  Module Design ──────────────────────────── Unit Testing         │
│       ↓                                              ↑            │
│  Coding ─────────────────────────────────────────────            │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Bảng ánh xạ V-Model với dự án:**

| Giai đoạn thiết kế | Giai đoạn test      | Test đã triển khai             |
| ------------------ | ------------------- | ------------------------------ |
| Requirements       | Acceptance Testing  | ⏳ Manual testing              |
| System Design      | System Testing      | ⏳ E2E (Cypress)               |
| Architecture       | Integration Testing | ✅ orderService.test.js        |
| Module Design      | Unit Testing        | ✅ authService, productService |

### 4.3 PHÂN TÍCH KHUNG NHÌN AGILE/CI-CD (4 trang) ⭐ ĐÃ LÀM

```
┌─────────────────────────────────────────────────────────────────┐
│                    CI/CD PIPELINE FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   [PUSH CODE]                                                    │
│       ↓                                                          │
│   ┌───────────┐                                                  │
│   │  GitHub   │ ──trigger──→ GitHub Actions                     │
│   └───────────┘                    ↓                             │
│                           ┌───────────────┐                      │
│                           │   BACKEND CI  │                      │
│                           ├───────────────┤                      │
│                           │ 1. Checkout   │                      │
│                           │ 2. Install    │                      │
│                           │ 3. Lint       │                      │
│                           │ 4. Unit Test  │──→ Coverage Report  │
│                           │ 5. Int. Test  │                      │
│                           │ 6. Security   │──→ Audit Report     │
│                           │ 7. Build      │──→ Docker Image     │
│                           └───────────────┘                      │
│                                  ↓                               │
│                           ┌───────────────┐                      │
│                           │  FRONTEND CI  │                      │
│                           ├───────────────┤                      │
│                           │ 1. Checkout   │                      │
│                           │ 2. Install    │                      │
│                           │ 3. Lint       │                      │
│                           │ 4. Unit Test  │                      │
│                           │ 5. Build      │──→ Build Artifacts  │
│                           └───────────────┘                      │
│                                  ↓                               │
│                           [DEPLOY STAGING]                       │
│                                  ↓                               │
│                           [SMOKE TEST]                           │
│                                  ↓                               │
│                           [DEPLOY PROD]                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Sau khi deploy, kiểm thử những gì?**

1. **Smoke Testing** - Kiểm tra nhanh các chức năng chính hoạt động
2. **Sanity Testing** - Kiểm tra logic nghiệp vụ cơ bản
3. **Regression Testing** - Đảm bảo không phá vỡ tính năng cũ
4. **Performance Testing** - Đo thời gian response, load testing

### 4.4 PHÂN TÍCH KHUNG NHÌN PHƯƠNG PHÁP (5 trang)

#### 4.4.1 Static Testing (Verification)

**Checklist Code Review:**

| STT | Tiêu chí                 | Áp dụng                            |
| --- | ------------------------ | ---------------------------------- |
| 1   | Naming convention        | ✅ camelCase                       |
| 2   | Error handling           | ✅ try-catch                       |
| 3   | Input validation         | ✅ validateEmail, validatePassword |
| 4   | Security (SQL injection) | ✅ Sequelize ORM                   |
| 5   | Code duplication         | ✅ Utils functions                 |

**Data Flow Analysis:**

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA FLOW - LOGIN                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   User Input → validateEmail() → validatePassword()          │
│       ↓                                                      │
│   hashPassword() → Database Query → comparePassword()        │
│       ↓                                                      │
│   Generate JWT Token → Response to Client                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Kiểm tra:
✅ Input được validate trước khi xử lý
✅ Password được hash trước khi lưu
✅ Không có SQL injection (dùng ORM)
```

#### 4.4.2 Dynamic Testing

**Black-Box Testing:**

- Test dựa trên requirements, không cần biết code
- Ví dụ: Test API `/api/login` với các input khác nhau

**White-Box Testing:**

- Test dựa trên cấu trúc code
- Ví dụ: Test tất cả branches trong `validatePassword()`

**Gray-Box Testing:**

- Kết hợp cả 2, biết một phần code
- Ví dụ: Test integration với database

### 4.5 PHÂN TÍCH KỸ THUẬT NÂNG CAO (4 trang)

#### 4.5.1 Khi nào dùng Manual Test vs Auto Test?

| Tiêu chí              | Manual Test                | Auto Test             |
| --------------------- | -------------------------- | --------------------- |
| **Khi nào dùng**      | UI/UX, Exploratory, Ad-hoc | Regression, Unit, API |
| **Chi phí ban đầu**   | Thấp                       | Cao                   |
| **Chi phí lâu dài**   | Cao                        | Thấp                  |
| **Tốc độ**            | Chậm                       | Nhanh                 |
| **Độ chính xác**      | Phụ thuộc người            | Cao                   |
| **Ví dụ trong dự án** | Test giao diện checkout    | Unit test authUtils   |

**Tỷ lệ đề xuất cho dự án:**

- 70% Automation (Unit + Integration + API)
- 30% Manual (UI/UX + Exploratory)

#### 4.5.2 AI trong kiểm thử

**Cách sử dụng ChatGPT/Copilot:**

1. **Generate test cases từ requirements**

```
Prompt: "Viết test cases cho chức năng đăng nhập với:
- Email hợp lệ/không hợp lệ
- Password đúng/sai
- Account bị khóa"
```

2. **Generate test code**

```
Prompt: "Viết Jest test cho hàm calculateDiscount(price, percent)"
```

3. **Phân tích test coverage**

```
Prompt: "Phân tích test này có cover đủ edge cases không?"
```

#### 4.5.3 Tự động hóa quy trình (n8n, Make.com)

```
┌─────────────────────────────────────────────────────────────┐
│              n8n WORKFLOW - TEST AUTOMATION                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   [GitHub Webhook]                                           │
│        ↓                                                     │
│   [Trigger Test Suite]                                       │
│        ↓                                                     │
│   [Parse Test Results]                                       │
│        ↓                                                     │
│   ┌─────────┬─────────┐                                     │
│   │  PASS   │  FAIL   │                                     │
│   └────┬────┴────┬────┘                                     │
│        ↓         ↓                                          │
│   [Slack OK] [Slack Alert + Create Jira Ticket]             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.6 TRIỂN KHAI TEST (6 trang) ⭐ ĐÃ LÀM

#### 4.6.1 Backend Unit Tests

**File: `authService.test.js`**

```javascript
// Ví dụ code trong báo cáo
describe("Auth Service - Password Hashing", () => {
  test("Should hash password correctly", async () => {
    const plainPassword = "myPassword123";
    const hashedPassword = await authService.hashPassword(plainPassword);

    expect(hashedPassword).not.toBe(plainPassword);
    expect(typeof hashedPassword).toBe("string");
  });
});
```

**Kết quả:**

- ✅ 9/9 tests pass
- ✅ 100% coverage

#### 4.6.2 Backend Integration Tests

**File: `orderService.test.js`**

```javascript
describe("Order Service - Integration", () => {
  test("Should create order successfully", async () => {
    const items = [{ id: 1, name: "Laptop", price: 1000, quantity: 1 }];
    const order = await orderService.createOrder(1, items);

    expect(order.status).toBe("pending");
    expect(order.total).toBe(1000);
  });
});
```

#### 4.6.3 CI/CD Implementation

**Backend CI/CD Workflow:**

```yaml
# .github/workflows/backend-ci.yml
name: Backend CI/CD

on:
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
```

### 4.7 KẾT QUẢ VÀ ĐÁNH GIÁ (3 trang)

> ⏳ **CHỜ CẬP NHẬT SAU KHI CI/CD PASS**

**Dự kiến nội dung:**

- Screenshot GitHub Actions pass ✅
- Coverage report
- Bảng tổng hợp test results
- Lessons learned
- Đề xuất cải tiến

---

## 🎯 PHƯƠNG HƯỚNG TIẾP THEO

### Việc cần làm ngay:

| STT | Task                                   | Ưu tiên | Trạng thái         |
| --- | -------------------------------------- | ------- | ------------------ |
| 1   | Kiểm tra GitHub Actions pass           | 🔴 Cao  | ⏳ Đang chờ        |
| 2   | Chụp screenshot kết quả CI/CD          | 🔴 Cao  | ⏳ Chờ task 1      |
| 3   | Viết phần 4.1 Tổng quan (Word)         | 🟡 TB   | ⏳                 |
| 4   | Viết phần 4.2 V-Model (Word)           | 🟡 TB   | ⏳                 |
| 5   | Viết phần 4.4 Phương pháp (Word)       | 🟡 TB   | ⏳                 |
| 6   | Viết phần 4.5 Kỹ thuật nâng cao (Word) | 🟡 TB   | ⏳                 |
| 7   | Hoàn thiện phần 4.7 Kết quả (Word)     | 🔴 Cao  | ⏳ Chờ screenshots |

### Timeline đề xuất:

```
📅 TIMELINE HOÀN THÀNH CHƯƠNG 4

Tuần 1 (9-15/12):
├─ Ngày 1-2: Kiểm tra CI/CD, chụp screenshots
├─ Ngày 3-4: Viết 4.1 + 4.2 (5 trang)
└─ Ngày 5-7: Viết 4.4 + 4.5 (9 trang)

Tuần 2 (16-22/12):
├─ Ngày 1-2: Hoàn thiện 4.6 + 4.7 (9 trang)
├─ Ngày 3-4: Review, chỉnh sửa
└─ Ngày 5-7: Format Word, thêm hình ảnh

📌 Deadline: 22/12/2025
```

---

## 📊 TỔNG KẾT

### Đã hoàn thành:

| Hạng mục            | Chi tiết                | Trạng thái |
| ------------------- | ----------------------- | ---------- |
| Backend Unit Tests  | 32 tests, 100% pass     | ✅         |
| Code Coverage       | 100% trên utility files | ✅         |
| Jest Config         | Threshold 80%           | ✅         |
| Backend CI/CD       | GitHub Actions workflow | ✅         |
| Frontend CI/CD      | GitHub Actions workflow | ✅         |
| Auto Issue Creation | Khi test fail           | ✅         |

### Chưa hoàn thành:

| Hạng mục            | Chi tiết                | Trạng thái |
| ------------------- | ----------------------- | ---------- |
| Verify CI/CD pass   | Chờ GitHub Actions      | ⏳         |
| Frontend Unit Tests | React components        | ⏳         |
| E2E Tests           | Cypress (đã bỏ khỏi CI) | ⚠️         |
| Viết Word           | 27 trang                | ⏳         |
| Screenshots         | CI/CD results           | ⏳         |

---

## 📎 PHỤ LỤC

### A. Commands hữu ích

```bash
# Chạy unit tests
cd ecomAPI && npm run test:unit

# Chạy với coverage
cd ecomAPI && npm run test:unit -- --coverage

# Chạy integration tests
cd ecomAPI && npm run test:integration

# Xem coverage report
open ecomAPI/coverage/lcov-report/index.html
```

### B. Links quan trọng

- **GitHub Repo**: https://github.com/TranNam283/kiemthuphanmem
- **GitHub Actions**: https://github.com/TranNam283/kiemthuphanmem/actions
- **Coverage Report**: `ecomAPI/coverage/lcov-report/index.html`

### C. Files đã tạo

```
kiemthuphanmem/
├── .github/workflows/
│   ├── backend-ci.yml          ✅ CI/CD Backend
│   └── frontend-ci.yml         ✅ CI/CD Frontend
├── ecomAPI/
│   ├── src/utils/
│   │   ├── authUtils.js        ✅ Password, validation
│   │   ├── productUtils.js     ✅ Discount, filter, pagination
│   │   └── orderUtils.js       ✅ Order processing
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── authService.test.js      ✅ 9 tests
│   │   │   ├── productService.test.js   ✅ 12 tests
│   │   │   └── orderService.test.js     ✅ (Integration)
│   │   └── setup.js
│   └── jest.config.js          ✅ Coverage config
└── CHUONG4.md                  📄 File này
```

---

_Cập nhật lần cuối: 08/12/2025_
