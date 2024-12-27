import { vi } from 'vitest';

/**
 * Create a mock for a module with optional implementation
 * @param {string} modulePath - Path to the module to mock
 * @param {Object} mockImplementation - Optional mock implementation
 * @returns {Object} Mocked module
 */
export function createMock(modulePath, mockImplementation = {}) {
  const originalModule = vi.importActual(modulePath);
  return {
    ...originalModule,
    ...mockImplementation
  };
}

/**
 * Generate test data for consistent testing
 * @param {string} type - Type of test data to generate
 * @returns {Object} Generated test data
 */
export function generateTestData(type) {
  const testDataMap = {
    resource: {
      id: 'test-resource-1',
      title: 'Test Resource',
      content: 'Sample content for testing',
      category: 'Quick Start Guides',
      tags: ['test', 'sample']
    },
    category: {
      id: 'test-category-1',
      name: 'Test Category',
      resources: []
    }
  };

  return testDataMap[type] || {};
}

/**
 * Create a sandboxed testing environment
 * @returns {Object} Testing sandbox with cleanup method
 */
export function createTestSandbox() {
  const mocks = [];

  return {
    mock: (modulePath, mockImplementation) => {
      const mock = createMock(modulePath, mockImplementation);
      mocks.push(mock);
      return mock;
    },
    cleanup: () => {
      mocks.forEach(mock => vi.restoreAllMocks());
    }
  };
}

/**
 * Simulate async operation for testing
 * @param {*} result - Result to resolve
 * @param {number} delay - Delay in milliseconds
 * @returns {Promise} Simulated async promise
 */
export function simulateAsyncOperation(result, delay = 100) {
  return new Promise(resolve => {
    setTimeout(() => resolve(result), delay);
  });
}
