// Test setup and global configuration
import { logger } from '../utils/logger'

// Suppress logs during tests
logger.silent = true

// Global test timeout
jest.setTimeout(10000)

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/autoenroll_test'
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock_secret'
process.env.PBKDF2_SALT = 'test-salt-for-pbkdf2'
process.env.PBKDF2_ITERATIONS = '150000'

// Extend global namespace for test helpers
declare global {
  var testHelpers: {
    sleep: (ms: number) => Promise<unknown>;
    generateRandomString: (length?: number) => string;
    generateRandomEmail: () => string;
  };
}

// Global test helpers
global.testHelpers = {
  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  generateRandomString: (length: number = 10) => {
    return Math.random().toString(36).substring(2, length + 2)
  },
  generateRandomEmail: () => {
    return `test-${Math.random().toString(36).substring(7)}@test.com`
  },
}

// Clean up after all tests
afterAll(async () => {
  // Add cleanup logic here if needed
  await new Promise(resolve => setTimeout(resolve, 500))
})
