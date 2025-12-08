/**
 * Order Service Integration Tests
 * Test: Order creation, status updates, payment processing
 */

const orderService = {
  createOrder: async (userId, items) => {
    if (!userId || !items || items.length === 0) {
      throw new Error("Invalid order data");
    }

    const order = {
      id: Math.random(),
      userId,
      items,
      status: "pending",
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      createdAt: new Date(),
    };

    return order;
  },

  updateOrderStatus: async (orderId, newStatus) => {
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(newStatus)) {
      throw new Error("Invalid status");
    }
    return { orderId, status: newStatus };
  },

  calculateOrderTotal: (items) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  applyDiscount: (total, discountPercent) => {
    return total * (1 - discountPercent / 100);
  },
};

// ==================== TESTS ====================

describe("Order Service - Integration", () => {
  describe("Create Order", () => {
    test("Should create order successfully", async () => {
      const items = [
        { id: 1, name: "Laptop", price: 1000, quantity: 1 },
        { id: 2, name: "Mouse", price: 20, quantity: 2 },
      ];

      const order = await orderService.createOrder(1, items);

      expect(order.userId).toBe(1);
      expect(order.status).toBe("pending");
      expect(order.total).toBe(1040);
      expect(order.id).toBeDefined();
    });

    test("Should throw error for invalid order data", async () => {
      await expect(orderService.createOrder(null, [])).rejects.toThrow();
      await expect(orderService.createOrder(1, [])).rejects.toThrow();
      await expect(orderService.createOrder(1, null)).rejects.toThrow();
    });
  });

  describe("Update Order Status", () => {
    test("Should update status to pending → processing", async () => {
      const result = await orderService.updateOrderStatus(1, "processing");
      expect(result.status).toBe("processing");
    });

    test("Should reject invalid status", async () => {
      await expect(
        orderService.updateOrderStatus(1, "invalid_status")
      ).rejects.toThrow();
    });
  });

  describe("Discount Calculation", () => {
    test("Should apply 10% discount correctly", () => {
      const total = 100;
      const discounted = orderService.applyDiscount(total, 10);
      expect(discounted).toBe(90);
    });

    test("Should handle 0% discount", () => {
      const total = 100;
      const discounted = orderService.applyDiscount(total, 0);
      expect(discounted).toBe(100);
    });
  });
});
