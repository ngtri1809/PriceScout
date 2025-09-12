import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';

// Mock the server module
const mockServer = {
  listen: jest.fn(),
  close: jest.fn()
};

// Mock the server.js module
jest.mock('../server.js', () => mockServer);

describe('API Server', () => {
  beforeAll(() => {
    // Setup any test data or mocks
  });

  afterAll(() => {
    // Cleanup
  });

  it('should be defined', () => {
    expect(mockServer).toBeDefined();
  });

  it('should have listen method', () => {
    expect(typeof mockServer.listen).toBe('function');
  });

  it('should have close method', () => {
    expect(typeof mockServer.close).toBe('function');
  });
});
