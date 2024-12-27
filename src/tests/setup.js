import { vi } from 'vitest';

// Mock browser APIs
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  writable: true
});

// Add any global mocks or setup needed for tests
vi.mock('fuse.js', () => ({
  default: vi.fn()
}));

// Polyfill for global functions if needed
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
};
