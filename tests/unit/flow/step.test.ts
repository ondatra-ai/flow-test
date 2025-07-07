import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Context } from '../../../src/flow/context.js';
import { Step } from '../../../src/flow/step.js';
import { Logger } from '../../../src/utils/logger.js';

// Mock logger functions
const mockLoggerInfo = vi.fn();
const mockLoggerError = vi.fn();
const mockLoggerDebug = vi.fn();
const mockLoggerWarn = vi.fn();

const mockLogger = {
  info: mockLoggerInfo,
  error: mockLoggerError,
  debug: mockLoggerDebug,
  warn: mockLoggerWarn,
} as unknown as Logger;

describe('Step', () => {
  beforeEach(() => {
    mockLoggerInfo.mockClear();
    mockLoggerError.mockClear();
    mockLoggerDebug.mockClear();
    mockLoggerWarn.mockClear();
  });

  describe('constructor', () => {
    it('should create a step with parameters and logger', () => {
      const step = new Step(
        'test-step',
        'Test message',
        'next-step',
        mockLogger
      );
      expect(step).toBeDefined();
    });
  });

  describe('execute', () => {
    it('should execute log action successfully', async () => {
      const step = new Step(
        'test-step',
        'Test message',
        'next-step',
        mockLogger
      );
      const context = new Context();
      const result = await step.execute(context);

      expect(result).toBe(true);
      expect(mockLoggerInfo).toHaveBeenCalledWith('Test message');
    });

    it('should always return true for logging', async () => {
      const step = new Step('test-step', 'Test message', null, mockLogger);
      const context = new Context();
      const result = await step.execute(context);

      expect(result).toBe(true);
    });
  });
});
