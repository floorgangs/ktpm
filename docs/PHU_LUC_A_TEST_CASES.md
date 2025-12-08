# PHỤ LỤC A - CHI TIẾT TEST CASES

## A.1 Authentication Module - Test Cases

### A.1.1 Source Code: authUtils.js

```javascript
const bcrypt = require("bcryptjs");

const authUtils = {
  hashPassword: async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  },

  comparePassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },

  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword: (password) => {
    if (!password) return false;
    return password.length >= 6;
  },
};

module.exports = authUtils;
```

### A.1.2 Bảng Test Cases

| ID | Test Case | Input | Expected | Actual | Status |
|----|-----------|-------|----------|--------|--------|
| TC01 | Hash password | "myPassword123" | Chuỗi hash ≠ input | Chuỗi hash | ✅ PASS |
| TC02 | Compare password - match | Password đúng | true | true | ✅ PASS |
| TC03 | Compare password - no match | Password sai | false | false | ✅ PASS |
| TC04 | Email hợp lệ | "user@example.com" | true | true | ✅ PASS |
| TC05 | Email không hợp lệ | "plainaddress" | false | false | ✅ PASS |
| TC06 | Password mạnh (>=6 ký tự) | "password123" | true | true | ✅ PASS |
| TC07 | Password yếu (<6 ký tự) | "12345" | false | false | ✅ PASS |
| TC08 | Password null | null | false | false | ✅ PASS |
| TC09 | Password undefined | undefined | false | false | ✅ PASS |

---

## A.2 Product Module - Test Cases

### A.2.1 Source Code: productUtils.js

```javascript
const productUtils = {
  calculateDiscountedPrice: (originalPrice, discountPercent) => {
    if (discountPercent < 0 || discountPercent > 100) {
      throw new Error("Invalid discount percentage");
    }
    return originalPrice * (1 - discountPercent / 100);
  },

  filterByPrice: (products, minPrice, maxPrice) => {
    return products.filter(p => p.price >= minPrice && p.price <= maxPrice);
  },

  filterByCategory: (products, categoryId) => {
    return products.filter(p => p.categoryId === categoryId);
  },

  paginateProducts: (products, page, pageSize) => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return {
      data: products.slice(startIndex, endIndex),
      page,
      pageSize,
      totalItems: products.length,
      totalPages: Math.ceil(products.length / pageSize),
    };
  },

  searchProducts: (products, keyword) => {
    const lowerKeyword = keyword.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(lowerKeyword) ||
      (p.description && p.description.toLowerCase().includes(lowerKeyword))
    );
  },
};

module.exports = productUtils;
```

### A.2.2 Bảng Test Cases

| ID | Test Case | Input | Expected | Actual | Status |
|----|-----------|-------|----------|--------|--------|
| TC10 | Giảm 20% | price=100, discount=20 | 80 | 80 | ✅ PASS |
| TC11 | Giảm 50% | price=200, discount=50 | 100 | 100 | ✅ PASS |
| TC12 | Discount > 100% | discount=150 | Error | Error | ✅ PASS |
| TC13 | Giảm 0% | price=100, discount=0 | 100 | 100 | ✅ PASS |
| TC14 | Lọc theo giá | min=20, max=100 | 2 products | 2 products | ✅ PASS |
| TC15 | Lọc theo category | categoryId=1 | 2 products | 2 products | ✅ PASS |
| TC16 | Phân trang - page 1 | page=1, size=10 | 10 items | 10 items | ✅ PASS |
| TC17 | Phân trang - page 2 | page=2, size=10 | items từ 11 | items từ 11 | ✅ PASS |
| TC18 | Trang cuối ít items | page=3, size=10 | 5 items | 5 items | ✅ PASS |
| TC19 | Tìm theo tên | "Keyboard" | 1 product | 1 product | ✅ PASS |
| TC20 | Tìm theo mô tả | "gaming" | 2 products | 2 products | ✅ PASS |
| TC21 | Không tìm thấy | "Tablet" | 0 products | 0 products | ✅ PASS |

---

## A.3 Order Module - Integration Test Cases

### A.3.1 Bảng Test Cases

| ID | Test Case | Input | Expected | Actual | Status |
|----|-----------|-------|----------|--------|--------|
| TC22 | Tạo đơn hàng hợp lệ | userId=1, items=[...] | Order với total | Order created | ✅ PASS |
| TC23 | Tạo đơn - items rỗng | items=[] | Error | Error | ✅ PASS |
| TC24 | Tạo đơn - userId null | userId=null | Error | Error | ✅ PASS |
| TC25 | Cập nhật status | "processing" | status updated | status updated | ✅ PASS |
| TC26 | Status không hợp lệ | "invalid" | Error | Error | ✅ PASS |
| TC27 | Áp dụng giảm giá 10% | total=100, discount=10 | 90 | 90 | ✅ PASS |

---

## A.4 Jest Configuration

### A.4.1 File: jest.config.js

```javascript
module.exports = {
  testEnvironment: "node",
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/utils/authUtils.js",
    "src/utils/productUtils.js",
    "src/utils/orderUtils.js",
  ],
  testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testTimeout: 10000,
  verbose: true,
};
```

### A.4.2 Giải thích cấu hình

| Thuộc tính | Giá trị | Mục đích |
|------------|---------|----------|
| testEnvironment | "node" | Chạy trong môi trường Node.js |
| coverageThreshold | 80% | Ngưỡng coverage tối thiểu |
| testTimeout | 10000ms | Timeout cho mỗi test |
| verbose | true | Hiển thị kết quả chi tiết |

---

## A.5 Code Coverage Report

```
-----------------------|---------|----------|---------|---------|
File                   | % Stmts | % Branch | % Funcs | % Lines |
-----------------------|---------|----------|---------|---------|
All files              |     100 |      100 |     100 |     100 |
 authUtils.js          |     100 |      100 |     100 |     100 |
 productUtils.js       |     100 |      100 |     100 |     100 |
 orderUtils.js         |     100 |      100 |     100 |     100 |
-----------------------|---------|----------|---------|---------|
```

---

*Kết thúc Phụ lục A*
