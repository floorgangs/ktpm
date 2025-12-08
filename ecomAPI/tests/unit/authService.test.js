/**
 * Auth Service Unit Tests
 * Test: Password Hashing, Email Validation, Password Validation
 */

const authService = require("../../src/utils/authUtils");

// ==================== TESTS ====================

describe("Auth Service - Password Hashing", () => {
  test("Should hash password correctly", async () => {
    const plainPassword = "myPassword123";
    const hashedPassword = await authService.hashPassword(plainPassword);

    expect(hashedPassword).not.toBe(plainPassword);
    expect(typeof hashedPassword).toBe("string");
    expect(hashedPassword.length).toBeGreaterThan(20);
  });

  test("Should compare password correctly - match", async () => {
    const plainPassword = "myPassword123";
    const hashedPassword = await authService.hashPassword(plainPassword);
    const isMatch = await authService.comparePassword(
      plainPassword,
      hashedPassword
    );

    expect(isMatch).toBe(true);
  });

  test("Should compare password correctly - no match", async () => {
    const plainPassword = "myPassword123";
    const wrongPassword = "wrongPassword";
    const hashedPassword = await authService.hashPassword(plainPassword);
    const isMatch = await authService.comparePassword(
      wrongPassword,
      hashedPassword
    );

    expect(isMatch).toBe(false);
  });
});

describe("Auth Service - Email Validation", () => {
  test("Should accept valid email", () => {
    const validEmails = [
      "user@example.com",
      "test.user@domain.co.uk",
      "my.email+tag@example.com",
    ];

    validEmails.forEach((email) => {
      expect(authService.validateEmail(email)).toBe(true);
    });
  });

  test("Should reject invalid email", () => {
    const invalidEmails = [
      "plainaddress",
      "@example.com",
      "user@.com",
      "user@domain",
    ];

    invalidEmails.forEach((email) => {
      expect(authService.validateEmail(email)).toBe(false);
    });
  });
});

describe("Auth Service - Password Validation", () => {
  test("Should accept strong password", () => {
    const strongPasswords = ["password123", "MyP@ssw0rd", "123456789"];

    strongPasswords.forEach((pwd) => {
      expect(authService.validatePassword(pwd)).toBe(true);
    });
  });

  test("Should reject weak password", () => {
    expect(authService.validatePassword("12345")).toBe(false);
    expect(authService.validatePassword("")).toBe(false);
    expect(authService.validatePassword("abc")).toBe(false);
  });

  test("Should handle null/undefined password", () => {
    expect(authService.validatePassword(null)).toBe(false);
    expect(authService.validatePassword(undefined)).toBe(false);
  });
});
