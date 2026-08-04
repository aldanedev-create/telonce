// Optional: Add global test setup
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock browser APIs if needed
globalThis.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};

// Mock fetch if needed
globalThis.fetch = vi.fn();

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});