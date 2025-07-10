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
        { default: 'next-step' },
        mockLogger
      );
      expect(step).toBeDefined();
    });
  });

  describe('execute', () => {
    it('should execute log action and return next step ID', async () => {
      const step = new Step(
        'test-step',
        'Test message',
        { default: 'next-step' },
        mockLogger
      );
      const context = new Context();
      const result = await step.execute(context);

      expect(result).toBe('next-step');
      expect(mockLoggerInfo).toHaveBeenCalledWith('Test message');
    });

    it('should return null for end step (empty object)', async () => {
      const step = new Step('test-step', 'Test message', {}, mockLogger);
      const context = new Context();
      const result = await step.execute(context);

      expect(result).toBe(null);
    });

    it('should use context routing key when available', async () => {
      const step = new Step(
        'test-step',
        'Test message',
        {
          bug: 'bug-fix-step',
          feature: 'feature-step',
          default: 'general-step',
        },
        mockLogger
      );
      const context = new Context();
      context.set('nextStep', 'bug');

      const result = await step.execute(context);

      expect(result).toBe('bug-fix-step');
    });

    it('should fallback to default when context key not found', async () => {
      const step = new Step(
        'test-step',
        'Test message',
        {
          bug: 'bug-fix-step',
          feature: 'feature-step',
          default: 'general-step',
        },
        mockLogger
      );
      const context = new Context();
      context.set('nextStep', 'nonexistent');

      const result = await step.execute(context);

      expect(result).toBe('general-step');
    });

    it('should return null when no default and context key not found', async () => {
      const step = new Step(
        'test-step',
        'Test message',
        {
          bug: 'bug-fix-step',
          feature: 'feature-step',
        },
        mockLogger
      );
      const context = new Context();
      context.set('nextStep', 'nonexistent');

      const result = await step.execute(context);

      expect(result).toBe(null);
    });
  });
});
