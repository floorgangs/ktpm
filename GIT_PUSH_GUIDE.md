# 🚀 HƯỚNG DẪN PUSH & CHẠY CI/CD

## ⚡ BƯỚC 1: Setup git & commit

```bash
# Go to project folder
cd d:\Projects\kiemthuphanmem

# Check status
git status

# Add all files
git add .

# Commit
git commit -m "🧪 Add backend unit tests + integration tests + E2E tests

- Added authService.test.js (password hashing, email validation)
- Added productService.test.js (discount, filtering, pagination)
- Added orderService integration tests
- Updated GitHub Actions workflows to auto-create issues on failure
- Updated package.json with test scripts"

# Push to GitHub
git push origin main
```

## ⏳ BƯỚC 2: Chờ GitHub Actions chạy

Sau khi push, GitHub Actions sẽ tự động:

1. ✅ Cài dependencies
2. ✅ Chạy linter
3. ✅ Chạy unit tests
4. ✅ Chạy integration tests
5. ❌ **Nếu lỗi** → Tự động tạo Issue

## 🔍 BƯỚC 3: Kiểm tra kết quả

**Vào GitHub repo:**
https://github.com/TranNam283/kiemthuphanmem

**Tab "Actions"** để xem:

- Workflow status (✅ PASS hoặc ❌ FAIL)
- Test results
- Coverage report

**Tab "Issues"** để xem:

- Nếu có lỗi → Issue sẽ được tạo tự động
- Chi tiết lỗi + hướng dẫn fix

## 📋 FILE ĐƯỢC TẠO/SỬA

✅ **ecomAPI/tests/unit/authService.test.js** - Unit tests cho authentication
✅ **ecomAPI/tests/unit/productService.test.js** - Unit tests cho product
✅ **ecomAPI/tests/integration/orderService.test.js** - Integration tests
✅ **eCommerce_Reactjs/cypress/e2e/homepage.cy.js** - E2E tests
✅ **ecomAPI/package.json** - Thêm test scripts
✅ **.github/workflows/backend-ci.yml** - Thêm auto-create issue
✅ **.github/workflows/frontend-ci.yml** - Thêm auto-create issue

## 🎯 EXPECTED RESULTS

### Nếu Tests PASS ✅

```
✓ Backend CI/CD - All tests passed
✓ Frontend CI/CD - Build successful
No issues created
```

### Nếu Tests FAIL ❌

```
❌ Backend Tests Failed
❌ Auto-created Issue #123 with:
  - Error details
  - Failed test names
  - Link to workflow logs
  - Fix instructions
```

## 💡 NEXT STEPS

1. **Push code lên GitHub**
2. **Chờ Actions chạy** (5-10 phút)
3. **Nếu pass** → Có thể chụp screenshot cho Word
4. **Nếu fail** → Fix code, push lại

---

## ⚠️ Lưu ý

- GitHub Actions free tier: **2000 minutes/month** (đủ dùng)
- Workflow chạy trên **ubuntu-latest**
- MySQL service trong CI/CD chạy trong Docker container
- Test results có thể xem tại: **Actions → Workflow run → Details**
