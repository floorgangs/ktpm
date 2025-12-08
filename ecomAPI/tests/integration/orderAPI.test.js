/**
 * Integration Test Example for Order API
 * Test API endpoints with real HTTP requests
 */

const request = require("supertest");
const app = require("../../src/server"); // Will need to export app

describe("Order API - Integration Tests", () => {
  let authToken;
  let testUserId;

  beforeAll(async () => {
    // Setup: Login to get auth token
    const loginResponse = await request(app).post("/api/user/login").send({
      email: "test@example.com",
      password: "Test123!",
    });

    authToken = loginResponse.body.token;
    testUserId = loginResponse.body.user.id;
  });

  describe("POST /api/order/create", () => {
    it("should return 401 without auth token", async () => {
      const response = await request(app).post("/api/order/create").send({
        addressUserId: 1,
        typeShipId: 1,
        arrDataShopCart: [],
      });

      expect(response.status).toBe(401);
    });

    it("should return 400 with missing required fields", async () => {
      const response = await request(app)
        .post("/api/order/create")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          // Missing addressUserId
          typeShipId: 1,
        });

      expect(response.status).toBe(400);
      expect(response.body.errCode).toBe(1);
    });

    it("should create order successfully with valid data", async () => {
      const response = await request(app)
        .post("/api/order/create")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          addressUserId: 1,
          typeShipId: 1,
          isPaymentOnlien: false,
          userId: testUserId,
          arrDataShopCart: [{ productId: 1, quantity: 2, price: 100 }],
        });

      expect(response.status).toBe(200);
      expect(response.body.errCode).toBe(0);
      expect(response.body).toHaveProperty("data");
    });
  });

  describe("GET /api/order/get-all-orders", () => {
    it("should return list of orders", async () => {
      const response = await request(app)
        .get("/api/order/get-all-orders")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ limit: 10, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should filter orders by status", async () => {
      const response = await request(app)
        .get("/api/order/get-all-orders")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ statusId: "S3" });

      expect(response.status).toBe(200);
      expect(response.body.data.every((order) => order.statusId === "S3")).toBe(
        true
      );
    });
  });
});
