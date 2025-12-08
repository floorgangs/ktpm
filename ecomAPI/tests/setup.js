// Test setup file
require("dotenv").config({ path: ".env.test" });

// Mock console to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging
  error: console.error,
};

// Set test timeout
jest.setTimeout(10000);
