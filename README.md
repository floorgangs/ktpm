# Kiểm thử Web Thương Mại Điện Tử (eCommerce) — Agile & CI/CD

Dự án gồm **Frontend React** + **Backend Node/Express** + **MySQL**, tập trung vào **kế hoạch kiểm thử theo V-Model**, automation (Jest/Cypress) và **CI/CD (GitHub Actions)**.

---

## 1) Giới thiệu đề tài

### Tổng quan

- Bài toán: kiểm thử hệ thống web thương mại điện tử (luồng chính: auth → browse sản phẩm → giỏ hàng → đặt hàng).
- Mục tiêu: chứng minh được **test strategy**, **test cases**, **automation**, và **evidence chạy thật**.
- Cách làm: triển khai theo hướng **Agile** (lặp/iterate) và dùng **CI** để tự động chạy test khi push/PR.

### Thách thức trong kiểm thử

- Hệ thống nhiều tầng (UI ↔ API ↔ DB) → dễ phát sinh lỗi tích hợp.
- Auth/AuthZ, dữ liệu đơn hàng/giỏ hàng → cần kiểm thử cả **contract** lẫn **trạng thái DB**.
- Non-functional (hiệu năng/bảo mật) → cần kịch bản + tiêu chí đo.

### Đóng góp chính

- Tổ chức kiểm thử theo tầng: unit (white-box), API-contract (black-box), integration DB-real, E2E UI, performance.
- Bộ tài liệu kiểm thử (test plan, test cases, checklists) + artifacts minh chứng.
- CI/CD workflows để chạy test tự động trên GitHub Actions.

---

## 2) Kiến trúc & triển khai

### Thành phần

- Frontend: React (thư mục `eCommerce_Reactjs/`)
- Backend: Node/Express (thư mục `ecomAPI/`)
- Database: MySQL (Docker)

### Docker Compose (khuyến dùng)

Chạy tại root repo:

```bash
docker-compose up -d --build
```

Truy cập:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- MySQL: localhost:3307

DB local (từ máy host):

- Host: `localhost`
- Port: `3307`
- User: `root`
- Password: `ecompassword`
- Database: `ecom`

Xem logs:

```bash
docker-compose logs -f
```

Reset (xoá volume DB):

```bash
docker-compose down -v
docker-compose up -d --build
```

---

## 3) Kế hoạch kiểm thử (V-Model) — đối tượng & chiến lược

Tư tưởng V-Model: thiết kế test song song theo mức độ.

- **Yêu cầu/Use-case → Acceptance / E2E (Validation)**
- **Thiết kế hệ thống (Workflow, UI/UX, Data model) → System/API tests**
- **Thiết kế thành phần → Integration tests**
- **Thiết kế chi tiết/hàm → Unit tests (Verification)**

Áp dụng vào đồ án:

- Workflow → test luồng nghiệp vụ (Cypress) + test API theo scenario.
- Data model/DB consistency → integration DB-real (supertest + sequelize) + đối chiếu DB state.
- UI/UX → E2E smoke (login/browse/cart).
- Non-functional:
  - Hiệu năng: k6 load/stress.
  - Bảo mật: npm audit trong CI + test auth/authz (401/403).

---

## 4) Phương luận kiểm thử (mức chi tiết)

### White-box (Unit)

- Mục tiêu: kiểm logic nội bộ/util.
- Chạy: `cd ecomAPI` → `npm run test:unit`

### Black-box (API contract)

- Mục tiêu: kiểm status/JSON contract + auth.
- Chạy: `cd ecomAPI` → `npm test` (hoặc chạy theo folder test nếu cần).

### Integration (DB-real)

- Mục tiêu: API thật + MySQL thật, verify DB state.
- Chạy: `cd ecomAPI` → `npm run test:db` (cần MySQL đang chạy).

### E2E UI (Cypress)

- Chạy: `cd eCommerce_Reactjs` → `npm run cy:run`.

### Performance (k6)

- Kịch bản ở `performance/k6/`:
  - `k6 run performance/k6/load-test.js`
  - `k6 run performance/k6/stress-test.js`

---

## 5) Kết quả đạt được 

- Vấn đáp & demo script: `docs/VAN_DAP_PREP.md`
- Diagram/ảnh minh hoạ kiến trúc & use-case: `docs/Images/`
- File drawio nguồn: `docs/Drawio_Links/`
- Test plan (docx) và báo cáo (docx/pptx): `docs/docs/`
- Test cases & scenario (xlsx): `docs/testcase/`, `docs/Test-Scenario.xlsx`
- Test report/unit test (xlsx): `docs/test-report.xlsx`, `docs/unit-test.xlsx`

---

## 6) CI/CD (GitHub Actions)

Repo có sẵn workflows:

- `Backend CI/CD` (file `.github/workflows/backend-ci.yml`)
  - PR/push: chạy **Security Audit** + **Test Backend** (unit/integration/DB-real)
  - Một số job build/deploy chỉ chạy trên nhánh `main` nên PR có thể hiện **Skipped** (đúng thiết kế)
- `Frontend CI/CD` (file `.github/workflows/frontend-ci.yml`)
  - PR/push: chạy unit + Cypress smoke + build
- `E2E (Real Backend) - Manual` (file `.github/workflows/e2e-real-backend.yml`)
  - chạy thủ công (workflow_dispatch) để test E2E với backend thật qua docker compose

Tiêu chí “thành công”: các check required trên PR **màu xanh**.

---

## 7) Kết luận & hướng phát triển

- Mở rộng coverage test case theo requirement, tăng số kịch bản E2E.
- Bổ sung thresholds rõ ràng cho k6 (SLA p95, error rate).
- Hoàn thiện CD (deploy staging/production) theo môi trường triển khai thực tế.
