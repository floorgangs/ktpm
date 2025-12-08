/**
 * Product Utilities - Pure functions for discount, filtering, pagination
 */

const productUtils = {
  calculateDiscountedPrice: (originalPrice, discountPercent) => {
    if (discountPercent < 0 || discountPercent > 100) {
      throw new Error("Invalid discount percentage");
    }
    return originalPrice * (1 - discountPercent / 100);
  },

  filterByPrice: (products, minPrice, maxPrice) => {
    return products.filter((p) => p.price >= minPrice && p.price <= maxPrice);
  },

  filterByCategory: (products, categoryId) => {
    return products.filter((p) => p.categoryId === categoryId);
  },

  paginateProducts: (products, page, limit) => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      data: products.slice(start, end),
      total: products.length,
      page,
      limit,
      totalPages: Math.ceil(products.length / limit),
    };
  },

  searchProducts: (products, keyword) => {
    const lowerKeyword = keyword.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerKeyword) ||
        p.description.toLowerCase().includes(lowerKeyword)
    );
  },
};

module.exports = productUtils;
