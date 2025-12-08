/**
 * Order Utilities - Pure functions for order validation and calculation
 */

const orderUtils = {
  validateOrderData: (data) => {
    if (!data.userId || !data.items || data.items.length === 0) {
      return { valid: false, error: "Missing required fields" };
    }
    return { valid: true };
  },

  calculateTotal: (items) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  applyDiscount: (total, discountPercent) => {
    if (discountPercent < 0 || discountPercent > 100) {
      throw new Error("Invalid discount");
    }
    return total * (1 - discountPercent / 100);
  },

  validateOrderStatus: (status) => {
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    return validStatuses.includes(status);
  },
};

module.exports = orderUtils;
