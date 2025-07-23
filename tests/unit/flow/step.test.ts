import { describe, it, expect, beforeEach } from 'vitest';

import { Context } from '../../../src/flow/context.js';
import { Step } from '../../../src/flow/step.js';
import { cast } from '../../../src/utils/cast.js';
import { createLoggerMock } from '../mocks/index.js';

// Create centralized logger mock
const loggerMock = createLoggerMock();

describe('Step', () => {
  beforeEach(() => {
    loggerMock.info.mockClear();
    loggerMock.error.mockClear();
    loggerMock.debug.mockClear();
    loggerMock.warn.mockClear();
  });

  describe('constructor', () => {
    it('should create a step with parameters and logger', () => {
      const step = new Step(
        'test-step',
        'Test message',
        { default: 'next-step' },
        loggerMock.mock
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
        loggerMock.mock
      );
      const context = new Context();
      const result = await step.execute(context);

      expect(result).toBe('next-step');
      expect(loggerMock.info).toHaveBeenCalledWith('Test message');
    });

    it('should return null for end step (empty object)', async () => {
      const step = new Step('test-step', 'Test message', {}, loggerMock.mock);
      const context = new Context();
      const result = await step.execute(context);

      expect(result).toBeNull();
    });

    it('should handle step with multiple next step options', async () => {
      const step = new Step(
        'test-step',
        'Test message',
        {
          success: 'success-step',
          error: 'error-step',
          default: 'default-step',
        },
        loggerMock.mock
      );
      const context = new Context();
      const result = await step.execute(context);

      expect(result).toBe('default-step');
    });

    it('should handle step with empty next step options gracefully', async () => {
      const step = new Step(
        'test-step',
        'Test message',
        { nonExistent: 'some-step' },
        loggerMock.mock
      );
      const context = new Context();
      const result = await step.execute(context);

      expect(result).toBeNull();
    });

    it('should throw error with undefined context', async () => {
      const step = new Step(
        'test-step',
        'Test message',
        { default: 'next-step' },
        loggerMock.mock
      );

      try {
        await step.execute(cast<Context>(undefined));
        expect.fail('Expected step.execute to throw an error');
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError);
        expect((error as Error).message).toContain(
          'Cannot read properties of undefined'
        );
      }
    });

    it('should handle step with empty message gracefully', async () => {
      const step = new Step(
        'test-step',
        '',
        { default: 'next-step' },
        loggerMock.mock
      );
      const context = new Context();
      const result = await step.execute(context);

      expect(result).toBe('next-step');
    });

    it('should handle step with null message gracefully', async () => {
      const step = new Step(
        'test-step',
        cast<string>(null),
        { default: 'next-step' },
        loggerMock.mock
      );
      const context = new Context();
      const result = await step.execute(context);

      expect(result).toBe('next-step');
    });

    it('should handle step with undefined message gracefully', async () => {
      const step = new Step(
        'test-step',
        cast<string>(undefined),
        { default: 'next-step' },
        loggerMock.mock
      );
      const context = new Context();
      const result = await step.execute(context);

      expect(result).toBe('next-step');
    });
  });
});
