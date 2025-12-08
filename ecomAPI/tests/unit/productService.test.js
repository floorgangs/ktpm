/**
 * Product Service Unit Tests
 * Test: Price calculation, filtering, pagination
 */

const productService = require("../../src/utils/productUtils");

// ==================== TESTS ====================

describe("Product Service - Discount Calculation", () => {
  test("Should calculate 20% discount correctly", () => {
    const originalPrice = 100;
    const discountedPrice = productService.calculateDiscountedPrice(
      originalPrice,
      20
    );
    expect(discountedPrice).toBe(80);
  });

  test("Should calculate 50% discount correctly", () => {
    const originalPrice = 200;
    const discountedPrice = productService.calculateDiscountedPrice(
      originalPrice,
      50
    );
    expect(discountedPrice).toBe(100);
  });

  test("Should throw error for invalid discount", () => {
    expect(() => {
      productService.calculateDiscountedPrice(100, 150);
    }).toThrow("Invalid discount percentage");
  });

  test("Should handle 0% discount", () => {
    const originalPrice = 100;
    const discountedPrice = productService.calculateDiscountedPrice(
      originalPrice,
      0
    );
    expect(discountedPrice).toBe(100);
  });
});

describe("Product Service - Filtering", () => {
  const mockProducts = [
    { id: 1, name: "Laptop", price: 1000, categoryId: 1 },
    { id: 2, name: "Mouse", price: 20, categoryId: 2 },
    { id: 3, name: "Keyboard", price: 50, categoryId: 2 },
    { id: 4, name: "Monitor", price: 300, categoryId: 1 },
  ];

  test("Should filter products by price range", () => {
    const result = productService.filterByPrice(mockProducts, 20, 100);
    expect(result.length).toBe(2);
    expect(result[0].name).toBe("Mouse");
    expect(result[1].name).toBe("Keyboard");
  });

  test("Should filter products by category", () => {
    const result = productService.filterByCategory(mockProducts, 1);
    expect(result.length).toBe(2);
    expect(result[0].name).toBe("Laptop");
    expect(result[1].name).toBe("Monitor");
  });
});

describe("Product Service - Pagination", () => {
  const mockProducts = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    price: (i + 1) * 10,
  }));

  test("Should paginate correctly - page 1", () => {
    const result = productService.paginateProducts(mockProducts, 1, 10);
    expect(result.data.length).toBe(10);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(3);
    expect(result.data[0].id).toBe(1);
  });

  test("Should paginate correctly - page 2", () => {
    const result = productService.paginateProducts(mockProducts, 2, 10);
    expect(result.data.length).toBe(10);
    expect(result.page).toBe(2);
    expect(result.data[0].id).toBe(11);
  });

  test("Should handle last page with fewer items", () => {
    const result = productService.paginateProducts(mockProducts, 3, 10);
    expect(result.data.length).toBe(5);
    expect(result.totalPages).toBe(3);
  });
});

describe("Product Service - Search", () => {
  const mockProducts = [
    { id: 1, name: "Gaming Laptop", description: "High performance laptop" },
    {
      id: 2,
      name: "Office Chair",
      description: "Comfortable chair for office",
    },
    { id: 3, name: "Mechanical Keyboard", description: "Gaming keyboard" },
  ];

  test("Should search by product name", () => {
    const result = productService.searchProducts(mockProducts, "Keyboard");
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("Mechanical Keyboard");
  });

  test("Should search by description", () => {
    const result = productService.searchProducts(mockProducts, "gaming");
    expect(result.length).toBe(2);
  });

  test("Should return empty array when no match", () => {
    const result = productService.searchProducts(mockProducts, "Tablet");
    expect(result.length).toBe(0);
  });
});
