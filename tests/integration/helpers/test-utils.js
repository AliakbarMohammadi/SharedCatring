/**
 * Test Utilities
 * ابزارهای کمکی تست
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Generate unique test email
 */
const generateEmail = (prefix = 'test') => {
  return `${prefix}.${Date.now()}@test.catering.ir`;
};

/**
 * Generate unique phone number
 */
const generatePhone = () => {
  const random = Math.floor(Math.random() * 90000000) + 10000000;
  return `0912${random}`;
};

/**
 * Generate UUID
 */
const generateId = () => uuidv4();

/**
 * Wait for specified milliseconds
 */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry function with exponential backoff
 */
const retry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await wait(delay * Math.pow(2, i));
      }
    }
  }
  throw lastError;
};

/**
 * Assert response is successful
 */
const assertSuccess = (response, message = 'پاسخ باید موفق باشد') => {
  if (!response.success) {
    const errorMsg = response.error?.message || 'خطای ناشناخته';
    throw new Error(`${message}: ${errorMsg}`);
  }
  return response;
};

/**
 * Assert response has Persian message
 */
const assertPersianMessage = (response) => {
  const message = response.message || response.error?.message;
  if (message) {
    // Check for Persian characters
    const persianRegex = /[\u0600-\u06FF]/;
    if (!persianRegex.test(message)) {
      console.warn(`⚠️ پیام فارسی نیست: ${message}`);
    }
  }
  return response;
};

/**
 * Log test step
 */
const logStep = (step, description) => {
  console.log(`\n📍 مرحله ${step}: ${description}`);
};

/**
 * Log success
 */
const logSuccess = (message) => {
  console.log(`✅ ${message}`);
};

/**
 * Log failure
 */
const logFailure = (message) => {
  console.log(`❌ ${message}`);
};

/**
 * Log info
 */
const logInfo = (message) => {
  console.log(`ℹ️ ${message}`);
};

module.exports = {
  generateEmail,
  generatePhone,
  generateId,
  wait,
  retry,
  assertSuccess,
  assertPersianMessage,
  logStep,
  logSuccess,
  logFailure,
  logInfo
};
