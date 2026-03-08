import '@testing-library/jest-dom/vitest'

// Mock environment variables for auth tests
process.env.ADMIN_PASSWORD = 'test-password-123'
process.env.ADMIN_SESSION_SECRET = 'test-secret-must-be-at-least-32-characters-long'
