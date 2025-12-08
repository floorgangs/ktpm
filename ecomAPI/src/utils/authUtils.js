/**
 * Auth Utilities - Pure functions for password/email validation
 */

const bcrypt = require("bcryptjs");

const authUtils = {
  hashPassword: async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },

  comparePassword: async (inputPassword, hashedPassword) => {
    return bcrypt.compare(inputPassword, hashedPassword);
  },

  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword: (password) => {
    return password && password.length >= 6 ? true : false;
  },
};

module.exports = authUtils;
