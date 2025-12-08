# 🚀 HƯỚNG DẪN CHI TIẾT - LÀMƯƠNG 4 BƯỚC THỨ BỨC (DỄ → KHÓ)

**Status:** Ready to implement  
**Thời gian ước tính:** 7-10 ngày (30 trang)  
**Priority Order:** Từ dễ → khó

---

## 📌 OVERVIEW: 7 PHẦN CHƯƠNG 4 (Thứ tự ưu tiên)

```
KHUYẾN CÁO THỨ TỰ LÀM:

PHẦN 1️⃣  4.1 - TỔNG QUAN (2 trang) ⭐ DỄ NHẤT
   └─ Viết: 1 ngày
   └─ Công việc: Giới thiệu, khái niệm cơ bản

PHẦN 2️⃣  4.4 - MANUAL VS AUTO (3 trang) ⭐ DỄ
   └─ Viết: 1 ngày
   └─ Công việc: Bảng so sánh, lý thuyết

PHẦN 3️⃣  4.2 - KHUNG NHÌN V-MODEL & AGILE (5 trang) ⭐⭐ TRUNG BÌNH
   └─ Viết: 2 ngày
   └─ Công việc: Sơ đồ + analysis

PHẦN 4️⃣  4.3 - KỸ THUẬT KIỂM THỬ (5 trang) ⭐⭐ TRUNG BÌNH
   └─ Viết: 2 ngày
   └─ Công việc: Lý thuyết + ví dụ

PHẦN 5️⃣  4.7 - KẾT LUẬN (1 trang) ⭐ DỄ
   └─ Viết: 0.5 ngày
   └─ Công việc: Summary

PHẦN 6️⃣  4.5 - CI/CD & DEPLOYMENT (5 trang) ⭐⭐ TRUNG BÌNH
   └─ Setup: 2-3 ngày (setup Render + GitHub Actions)
   └─ Viết: 1-2 ngày
   └─ Công việc: Hướng dẫn setup + screenshots

PHẦN 7️⃣  4.6 - TEST IMPLEMENTATION (4 trang) ⭐⭐⭐ KHÓ NHẤT
   └─ Code: 3-4 ngày
   └─ Viết: 1-2 ngày
   └─ Công việc: Viết test code examples + chạy tests
```

---

# 🎯 PHẦN 1️⃣: 4.1 - TỔNG QUAN (2 trang) - DỄ NHẤT ⭐

## Lịch trình: 1 ngày

## Output: ~2 trang Word

### ✅ Công việc cần làm:

1. **Mở file Word**

   - Tạo Section mới: "4.1 Tổng Quan"
   - Font: Times New Roman 12pt
   - Line spacing: 1.5

2. **4.1.1 Mục tiêu Kiểm thử** (0.5 trang)

   **Nội dung viết (copy-paste + sửa):**

   ```
   Mục tiêu chính của chương này là trình bày chiến lược kiểm thử
   toàn diện cho dự án E-Commerce, bao gồm:

   • Định nghĩa framework kiểm thử (V-Model và Agile/CI-CD)
   • Phân tích các kỹ thuật kiểm thử static và dynamic
   • Đánh giá khi nào sử dụng kiểm thử thủ công vs tự động
   • Thiết kế CI/CD pipeline tích hợp với GitHub Actions
   • Xây dựng deployment strategy sử dụng Render.com
   • Triển khai các test case thực tế (Jest, Cypress, React TL)
   • Đề xuất monitoring và post-deployment testing
   ```

3. **4.1.2 Phạm vi Kiểm thử** (0.5 trang)

   **Nội dung viết:**

   ```
   Phạm vi kiểm thử bao gồm 3 lớp ứng dụng:

   Backend (Node.js + Express):
   • Unit testing: Kiểm thử các function, module riêng lẻ
   • Integration testing: Kiểm thử tương tác với MySQL
   • API testing: Kiểm thử các endpoint REST

   Frontend (React.js):
   • Component testing: Kiểm thử các React component
   • Unit testing: Kiểm thử utility functions
   • E2E testing: Kiểm thử user workflows (Cypress)

   Database (MySQL):
   • Kiểm thử data integrity
   • Kiểm thử query performance
   • Kiểm thử backup/restore

   CI/CD Pipeline:
   • Automated testing on git push
   • Build verification
   • Pre-deployment smoke tests
   ```

4. **4.1.3 Framework Kiểm thử** (0.3 trang)

   **Nội dung viết + Sơ đồ:**

   ```
   Dự án sử dụng 2 framework kiểm thử:

   V-Model (Traditional):
   Requirements → Design → Implementation → Testing → Deployment

   Agile/CI-CD (Modern):
   Code → Test → Build → Deploy → Monitor (liên tục)

   [Thêm 2 sơ đồ - xem phần dưới]
   ```

5. **4.1.4 Tools & Technologies** (0.7 trang)

   **Tạo bảng:**

   ```
   | Lớp        | Tool              | Mục đích                    |
   |------------|-------------------|----------------------------|
   | Backend    | Jest              | Unit + Integration testing  |
   | Frontend   | Jest + React TL   | Component testing           |
   | E2E        | Cypress           | User workflow testing       |
   | CI/CD      | GitHub Actions    | Automated testing on push   |
   | Deploy     | Render.com        | Production hosting          |
   | Monitor    | Sentry (optional) | Error tracking              |
   | Coverage   | Codecov           | Test coverage analysis      |
   ```

### 🎨 Thêm Sơ đồ:

**Sơ đồ 1: V-Model Framework**

```
         ▲
    UAT  │    Test Design
         │   /          \
Req.Design-+            Integration Test
    |    │\              |
    v    │ \ Unit Test   v
Implementation Tests
```

**Sơ đồ 2: Agile CI/CD Cycle**

```
Developer Push Code
    ↓
GitHub Actions Triggered
    ├─ Run Tests (Jest, Cypress)
    ├─ Check Coverage
    └─ Build
    ↓
Deploy to Render
    ├─ Smoke Test
    ├─ Monitor
    └─ Alert if error
```

---

# 🎯 PHẦN 2️⃣: 4.4 - MANUAL VS AUTOMATION (3 trang) - DỄ ⭐

## Lịch trình: 1 ngày

## Output: ~3 trang Word

### ✅ Công việc cần làm:

1. **4.4.1 Kiểm thử Thủ công - Khi nào dùng?** (0.7 trang)

   **Nội dung viết:**

   ```
   Kiểm thử thủ công (Manual Testing) phù hợp với các trường hợp:

   1️⃣ Exploratory Testing
      • Khi chưa có requirement rõ ràng
      • Tester cần khám phá tính năng mới
      • Ví dụ: Test checkout flow lần đầu

   2️⃣ UX/UI Testing
      • Kiểm thử giao diện người dùng
      • Check responsive design (mobile, tablet, desktop)
      • Ví dụ: Button colors, font size, layout

   3️⃣ Ad-hoc Testing
      • Test những edge cases không dự tính
      • User behavior testing
      • Ví dụ: Click nhanh 10 lần button, network offline

   4️⃣ Complex Business Logic
      • Logic phức tạp khó tự động hóa
      • Decision-making based on multiple conditions
      • Ví dụ: Payment validation rules
   ```

2. **4.4.2 Kiểm thử Tự động - Khi nào dùng?** (0.7 trang)

   **Nội dung viết:**

   ```
   Kiểm thử tự động (Automation Testing) phù hợp với:

   1️⃣ Regression Testing
      • Kiểm tra lại tính năng cũ sau khi code mới
      • Chạy lại hàng trăm test cases
      • ROI cao (1 lần setup, chạy 1000 lần)

   2️⃣ Repetitive Tests
      • Login/Logout, Create/Update/Delete
      • Kiểm thử cùng data nhiều lần
      • Ví dụ: Test 100 products khác nhau

   3️⃣ Performance & Load Testing
      • Kiểm tra tốc độ: Chỉ công cụ tự động làm được
      • Ví dụ: Gửi 1000 request/second

   4️⃣ Smoke Tests (Before Production)
      • Kiểm tra critical paths
      • Chạy trước khi deploy
      • Ví dụ: Login → Browse → Add to Cart → Checkout
   ```

3. **4.4.3 So sánh Chi phí - Benefit** (0.8 trang)

   **Tạo bảng + Chart:**

   ```
   | Tiêu chí              | Manual          | Automation        |
   |----------------------|-----------------|-------------------|
   | Setup time           | 0 giờ (sẵn)    | 8-16 giờ          |
   | Time per run         | 30 phút         | 2 phút            |
   | Maintenance          | Thấp            | Cao (code changes)|
   | Find bugs            | Đa dạng         | Limited (script)  |
   | Regression coverage  | 30%             | 95%               |
   | ROI after 10 runs    | 0%              | Dương             |
   | ROI after 100 runs   | 0%              | +800%             |
   ```

   **Chart visualization:**

   ```
   Thời gian tích lũy (hours)

   100 │                          ╱ Automation
        │                    ╱╱╱╱╱
    50 │              ╱╱╱╱╱╱
        │         ╱╱╱ Manual
    10 │    ╱╱╱╱╱
        └─────────────────────────
          10  50  100  500  1000+ runs
   ```

4. **4.4.4 Chiến lược Hybrid cho E-Commerce** (0.8 trang)

   **Nội dung viết:**

   ```
   Khuyến nghị: 70% Automation + 30% Manual

   🎯 Phân bổ cụ thể cho E-Commerce:

   AUTOMATION (70%) - 70 test cases:
   ├─ 30 API endpoints (Backend)
   ├─ 20 React components (Frontend)
   ├─ 15 E2E critical flows (Cypress)
   ├─ 5 Performance tests
   └─ Chạy tự động trên GitHub Actions

   MANUAL (30%) - 30 test cases:
   ├─ 10 UX/UI tests
   ├─ 8 Exploratory tests
   ├─ 7 Payment integration tests
   ├─ 3 Security/Edge cases
   └─ Chạy bằng tay 1-2 lần/tuần

   📊 Chi phí:
   • Setup: 40 giờ (một lần)
   • Maintenance: 2 giờ/tuần
   • Per-test cost: 0.05 USD (sử dụng GitHub Actions free tier)
   ```

### 🎨 Thêm Visual:

**Decision Tree:**

```
Cần kiểm thử tính năng?
    ├─ Là repetitive/regression? → AUTOMATION
    ├─ Là exploratory/UX? → MANUAL
    ├─ Là critical path? → AUTOMATION
    ├─ Là edge case complex? → MANUAL
    └─ Là performance test? → AUTOMATION
```

---

# 🎯 PHẦN 3️⃣: 4.2 - KHUNG NHÌN V-MODEL & AGILE (5 trang) - TRUNG BÌNH ⭐⭐

## Lịch trình: 2 ngày

## Output: ~5 trang Word

### ✅ Công việc ngày 1: V-Model (2.5 trang)

**4.2.1 V-Model Perspective** (2.5 trang)

**Nội dung viết - Phần 1: Giới thiệu (0.5 trang)**

```
V-Model (Verification and Validation Model) là mô hình test truyền thống
nhất, tách rõ ràng giai đoạn phát triển và test.

Đặc điểm:
• Mỗi giai đoạn phát triển có giai đoạn test tương ứng
• Test được thiết kế từ sớm (cùng lúc design)
• Phát hiện lỗi sớm → chi phí thấp hơn
• Thích hợp cho project có requirement rõ ràng
```

**Nội dung viết - Phần 2: Các lớp test (2 trang)**

```
LEFT SIDE (Development):                RIGHT SIDE (Testing):

Requirements
│                                        ← System Test
├─ System Design
│                                        ← Integration Test
├─ Module Design
│                                        ← Unit Test
└─ Code Implementation

MAPPING CHO E-COMMERCE:

LỚP 1: UNIT TEST (Code Level)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mục tiêu: Kiểm thử function/module riêng lẻ
Tool: Jest
Ví dụ tests:
  ✓ Test authentication logic (hash password)
  ✓ Test product filtering function
  ✓ Test discount calculation
  ✓ Test input validation

Ứng dụng trên dự án:
  Backend:
  • jest --testPath=src/controllers/authController.test.js
  • jest --testPath=src/services/productService.test.js

  Frontend:
  • jest --testPath=src/components/Cart.test.js
  • jest --testPath=src/utils/formatPrice.test.js

Metrics:
  • Mục tiêu: Code coverage > 70%
  • Hiện tại: Unknown (cần check)
  • Thời gian: 1-2 phút/chạy


LỚP 2: INTEGRATION TEST (Module Interaction)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mục tiêu: Kiểm thử tương tác giữa các module
Tool: Jest + MySQL database
Ví dụ tests:
  ✓ Auth + Database: User login → check password hash → return JWT
  ✓ Product + Database: Fetch product → verify SQL query → return data
  ✓ Order + Payment: Create order → call PayPal → update status

Ứng dụng trên dự án:
  • Backend integration tests (already in CI/CD)
  • Chạy: npm run test:integration
  • Sử dụng test database

Metrics:
  • Mục tiêu: API response time < 500ms
  • Hiện tại: Unknown
  • Thời gian: 5-10 phút/chạy


LỚP 3: SYSTEM TEST (Feature Level)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mục tiêu: Kiểm thử toàn bộ flow từ user perspective
Tool: Cypress (E2E)
Ví dụ tests:
  ✓ User login flow: Visit login page → enter credentials → check redirect
  ✓ Checkout flow: Add product → go to cart → fill address → pay → confirm
  ✓ Search flow: Enter keyword → filter by category → sort → pagination

Ứng dụng trên dự án:
  • cypress/e2e/login.cy.js
  • cypress/e2e/checkout.cy.js
  • cypress/e2e/search.cy.js

Metrics:
  • Mục tiêu: 10+ critical flows coverage
  • Hiện tại: Some Cypress tests exist
  • Thời gian: 2-5 phút/chạy


LỚP 4: UAT (User Acceptance Test)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mục tiêu: Kiểm thử từ góc độ business/end-user
Tool: Manual testing + Checklist
Ví dụ tests:
  ✓ Real payment with PayPal (sandbox)
  ✓ Real user scenarios (teacher/student using system)
  ✓ Business rules: Discount applies correctly
  ✓ Reporting: Can export sales data

Ứng dụng trên dự án:
  • Assign admin/customer to test
  • Check business requirements met
  • Verify data accuracy

Metrics:
  • Mục tiêu: 100% business requirements verified
  • Sign-off từ client
```

**Tạo bảng V-Model Mapping:**

```
┌─────────────────┬──────────────┬────────────┬───────────────┐
│ Test Level      │ Development  │ Tool       │ Time/Run      │
├─────────────────┼──────────────┼────────────┼───────────────┤
│ Unit Test       │ Code         │ Jest       │ 1-2 min       │
│ Integration     │ Module       │ Jest+MySQL │ 5-10 min      │
│ System (E2E)    │ Features     │ Cypress    │ 2-5 min       │
│ UAT             │ Business     │ Manual     │ 1-2 hours     │
└─────────────────┴──────────────┴────────────┴───────────────┘
```

---

### ✅ Công việc ngày 2: Agile/CI-CD (2.5 trang)

**4.2.2 Agile/CI-CD Perspective** (2.5 trang)

**Nội dung viết - Phần 1: Khái niệm (0.5 trang)**

```
Agile/CI-CD là mô hình test hiện đại:
• Test và code đi cùng nhau
• Test được chạy tự động liên tục
• Phản hồi nhanh (phút chứ không phải ngày)
• Phù hợp với startup, SaaS, DevOps culture
```

**Nội dung viết - Phần 2: Chi tiết Pipeline (2 trang)**

```
GITHUB ACTIONS CI/CD PIPELINE CHO E-COMMERCE
═════════════════════════════════════════════════

📊 HIỆN TẠI (Current state):
┌──────────────────────────────────────────────────────┐
│ Developer push code to main/develop                   │
│                ↓                                      │
│ GitHub Actions Trigger                               │
│        │                                              │
│        ├─ Backend CI                                  │
│        │   ├─ npm install                             │
│        │   ├─ npm run lint                            │
│        │   ├─ npm run test:unit                       │
│        │   ├─ npm run test:integration                │
│        │   └─ Upload coverage                         │
│        │                                              │
│        └─ Frontend CI                                 │
│            ├─ npm install                             │
│            ├─ npm run lint                            │
│            ├─ npm test (jest)                         │
│            ├─ npm run build                           │
│            ├─ npx cypress run (E2E)                   │
│            └─ Upload coverage                         │
│                                                       │
│ ✅ Result: Pass/Fail badge                           │
│ ❌ MISSING: Actual deployment                        │
└──────────────────────────────────────────────────────┘

📊 ĐỀ XUẤT (Proposed - thêm deployment):
┌──────────────────────────────────────────────────────┐
│ Developer push code to main                           │
│                ↓                                      │
│ Test (như trên)                                      │
│                ↓                                      │
│ BUILD DOCKER IMAGES                                  │
│    ├─ Build backend image                            │
│    ├─ Build frontend image                           │
│    └─ Push to Docker Hub (optional)                  │
│                ↓                                      │
│ DEPLOY TO RENDER                                     │
│    ├─ Deploy backend service                         │
│    ├─ Deploy frontend service                        │
│    └─ Wait for health check                          │
│                ↓                                      │
│ POST-DEPLOYMENT TEST                                 │
│    ├─ Smoke test on prod environment                 │
│    ├─ Monitor errors (Sentry)                        │
│    └─ Alert if critical issue                        │
│                ↓                                      │
│ ✅ Deployment complete                               │
└──────────────────────────────────────────────────────┘

CHI TIẾT TỪNG STAGE:

1️⃣ CODE COMMIT
   Action: Developer push code
   Trigger: git push to main/develop

2️⃣ CI/CD PIPELINE START
   Action: GitHub Actions kicks in
   Trigger: .github/workflows/backend-ci.yml
           .github/workflows/frontend-ci.yml

3️⃣ TEST & BUILD
   Action:
   • Install dependencies
   • Run linters (ESLint, Prettier)
   • Run unit tests (Jest)
   • Run integration tests (Jest + MySQL)
   • Run E2E tests (Cypress)
   • Build production bundle

   Duration: 5-10 minutes

   If FAIL:
   ❌ Stop pipeline
   ❌ Send Slack notification
   ❌ Create issue on GitHub

4️⃣ DOCKER BUILD & PUSH
   Action:
   • Build Docker image for backend
   • Build Docker image for frontend
   • Tag with git commit SHA
   • Push to Docker registry (Docker Hub or GitHub Container Registry)

   Commands:
   docker build -t ecom-backend:sha-abcd123 ./ecomAPI
   docker push ecom-backend:sha-abcd123

5️⃣ DEPLOY TO RENDER
   Action:
   • Connect Docker image to Render service
   • Auto pull latest image
   • Run container
   • Health check (wait for container to be ready)

   Thời gian: 2-5 phút

6️⃣ POST-DEPLOYMENT TESTING
   Action:
   • Run smoke tests against prod URL
   • Check if login works
   • Check if homepage loads
   • Monitor for errors

7️⃣ NOTIFY & COMPLETE
   Action:
   • Send Slack message "✅ Deployed successfully"
   • Update deployment status in GitHub
   • Create release notes
```

**Tạo sơ đồ CI/CD:**

```
┌─────────────┐
│   Developer │
│  Push Code  │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  GitHub Actions  │
│   CI/CD Trigger  │
└──────┬───────────┘
       │
       ├─── Frontend CI ───┬─── Unit Test (Jest)
       │                   ├─── E2E Test (Cypress)
       │                   ├─── Build
       │                   └─── Upload Coverage
       │
       ├─── Backend CI ────┬─── Unit Test (Jest)
       │                   ├─── Integration Test
       │                   ├─── Security Audit
       │                   └─── Upload Coverage
       │
       ├─── If All Pass ──►┌──────────────┐
       │                   │ Build Docker │
       │                   │ Images       │
       │                   └───────┬──────┘
       │                           │
       │                    ▼
       │                  ┌───────────────┐
       │                  │ Push to Render│
       │                  │ Deploy        │
       │                  └───────┬───────┘
       │                          │
       │                   ▼
       │                 ┌──────────────┐
       │                 │ Smoke Test   │
       │                 │ on Production│
       │                 └──────────────┘
       │
       └─── If Fail ──────► ❌ Stop & Alert
```

---

# 📝 CHI TIẾT VIẾT WORD CHO PHẦN 4.2

**Template cho từng subsection:**

**4.2.1 Heading**

```
Mở Word → Chèn → Hình ảnh/Sơ đồ → Định dạng
Font: Times New Roman 12pt
Heading 2 style
Line spacing: 1.5
Margin: 2.54cm (tất cả)
```

**Cách viết hiệu quả:**

1. Viết đoạn giới thiệu (3-4 dòng)
2. Liệt kê key points (bullet points)
3. Ví dụ cụ thể (code snippet hoặc diagram)
4. Bảng so sánh (nếu có)
5. Kết luận/summary

---

# 🎯 PHẦN 4️⃣: 4.3 - KỸ THUẬT KIỂM THỬ (5 trang) - TRUNG BÌNH ⭐⭐

## Lịch trình: 2 ngày

## Output: ~5 trang Word

### ✅ Công việc ngày 1: Static Testing (2.5 trang)

**4.3.1 Static Testing** (2.5 trang)

```
STATIC TESTING = Kiểm tra code mà không chạy nó
├─ Code Review
├─ Linting (ESLint)
├─ Prettier
└─ Data Flow Analysis

Cho E-Commerce Project:
```

**Nội dung viết (copy-paste):**

```
Static Testing là kiểm tra code trước khi chạy,
giúp phát hiện lỗi sớm mà không cần execution time.

1️⃣ CODE REVIEW CHECKLIST
──────────────────────────

□ Naming Convention
  ✓ Variables: camelCase (authToken, userData)
  ✓ Functions: camelCase (fetchUser, validateEmail)
  ✓ Classes: PascalCase (UserController, CartService)
  ✓ Constants: UPPER_SNAKE_CASE (MAX_RETRIES, API_KEY)

□ Code Quality
  ✓ Functions < 50 lines
  ✓ No duplicate code
  ✓ Single responsibility principle
  ✓ No hardcoded values

□ Security
  ✓ No password in logs
  ✓ No SQL injection vulnerability
  ✓ Input validation on all endpoints
  ✓ CORS properly configured

□ Error Handling
  ✓ Try-catch blocks for async operations
  ✓ Meaningful error messages
  ✓ Proper HTTP status codes
  ✓ No stack trace exposed to client

□ Documentation
  ✓ Function comments
  ✓ API endpoint documentation
  ✓ README updated
  ✓ Environment variables documented


2️⃣ LINTING RULES (ESLint)
───────────────────────────

Current config: .eslintrc.json

Các rules bắt buộc cho project:
√ no-unused-vars: Warn if variable declared but not used
√ no-console: Warn on console.log (remove in production)
√ no-var: Enforce let/const instead of var
√ eqeqeq: Use === instead of ==
√ indent: 2 spaces
√ quotes: Single quotes

Chạy linting:
$ npm run lint

Fix automatically:
$ npm run lint -- --fix


3️⃣ DATA FLOW ANALYSIS
──────────────────────

Ví dụ cho Login Flow:

Ngoài vào: password (user input)
│
├─ Validation: Check length >= 6
│
├─ Hash: bcryptjs.hash(password)
│
├─ Compare: bcryptjs.compare(inputPassword, hashedPassword)
│
└─ Ngoài ra: JWT token

⚠️ Kiểm tra:
  ✓ Password không được lưu plain text
  ✓ Hash được lưu đúng database
  ✓ JWT signed với SECRET_KEY
  ✓ Token expiry được set


4️⃣ SECURITY CODE SCAN
─────────────────────

Run npm audit:
$ npm audit

Output ví dụ:
```

found 5 vulnerabilities (4 moderate, 1 high)

high Prototype Pollution
express version 4.17.1

moderate Denial of Service
lodash version 4.17.20

```

Fix: npm update package-name


BẢNG SUMMARY STATIC TESTING:
╔═══════════════════╦════════════╦═════════════════════╗
║ Type              ║ Tool       ║ Effort/Benefit      ║
╠═══════════════════╬════════════╬═════════════════════╣
║ Code Review       ║ Manual     ║ High/High           ║
║ Linting           ║ ESLint     ║ Low/High            ║
║ Data Flow         ║ Manual+IDE ║ Medium/Medium       ║
║ Security Scan     ║ npm audit  ║ Low/High            ║
╚═══════════════════╩════════════╩═════════════════════╝
```

---

### ✅ Công việc ngày 2: Dynamic Testing (2.5 trang)

**4.3.2 Dynamic Testing** (2.5 trang)

```
DYNAMIC TESTING = Kiểm tra code bằng cách chạy nó
├─ Black-Box Testing (focus behavior)
├─ White-Box Testing (focus code)
└─ Gray-Box Testing (hybrid)

Chi tiết cho mỗi loại...
```

(Tương tự như trên, phần này sẽ dài 2.5 trang giải thích kỹ từng loại)

---

**💡 Tóm tắt: Làm theo thứ tự này**

1. **4.1 (1 ngày)** → Tổng quan dễ nhất, tạo motivation
2. **4.4 (1 ngày)** → Lý thuyết so sánh, dễ viết
3. **4.2 (2 ngày)** → V-Model + Agile, có sơ đồ
4. **4.3 (2 ngày)** → Kỹ thuật, copy-paste checklist
5. **4.7 (0.5 ngày)** → Kết luận, viết cuối
6. **4.5 (3 ngày)** → CI/CD, cần setup Render
7. **4.6 (3 ngày)** → Code examples, khó nhất

**Total: 12.5 ngày → 25-30 trang** ✅

Bạn muốn tôi **viết chi tiết full từng phần** hay chỉ cần file template Word để bạn fill in? 🤔
