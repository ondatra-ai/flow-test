import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Context, IContext } from '../../../../src/flow/context.js';
import { LogStep } from '../../../../src/flow/types/log-step.js';
import { Logger } from '../../../../src/utils/logger.js';
import { type LogStepConfig } from '../../../../src/validation/index.js';

describe('LogStep', () => {
  let mockLogger: Logger;
  let context: IContext;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    } as unknown as Logger;

    context = new Context();
  });

  describe('basic logging', () => {
    it('should log at info level', async () => {
      const config: LogStepConfig = {
        id: 'test-log',
        type: 'log',
        message: 'Test info message',
        level: 'info',
        nextStepId: { default: 'next-step' },
      };

      const logStep = new LogStep(mockLogger, config);
      const result = await logStep.execute(context);

      expect(mockLogger.info).toHaveBeenCalledWith('Test info message');
      expect(result).toBe('next-step');
    });

    it('should log at error level', async () => {
      const config: LogStepConfig = {
        id: 'test-log',
        type: 'log',
        message: 'Test error message',
        level: 'error',
        nextStepId: { default: 'next-step' },
      };

      const logStep = new LogStep(mockLogger, config);
      await logStep.execute(context);

      expect(mockLogger.error).toHaveBeenCalledWith('Test error message');
    });

    it('should log at warn level', async () => {
      const config: LogStepConfig = {
        id: 'test-log',
        type: 'log',
        message: 'Test warning message',
        level: 'warn',
        nextStepId: { default: 'next-step' },
      };

      const logStep = new LogStep(mockLogger, config);
      await logStep.execute(context);

      expect(mockLogger.warn).toHaveBeenCalledWith('Test warning message');
    });

    it('should log at debug level', async () => {
      const config: LogStepConfig = {
        id: 'test-log',
        type: 'log',
        message: 'Test debug message',
        level: 'debug',
        nextStepId: { default: 'next-step' },
      };

      const logStep = new LogStep(mockLogger, config);
      await logStep.execute(context);

      expect(mockLogger.debug).toHaveBeenCalledWith('Test debug message');
    });
  });

  describe('context placeholders', () => {
    it('should replace context placeholders in message', async () => {
      const config: LogStepConfig = {
        id: 'test-log',
        type: 'log',
        message: 'User ${username} logged in from ${location}',
        level: 'info',
        nextStepId: { default: 'next-step' },
      };

      context.set('username', 'john');
      context.set('location', 'New York');

      const logStep = new LogStep(mockLogger, config);
      await logStep.execute(context);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'User john logged in from New York'
      );
    });

    it('should keep placeholder unchanged if context key not found', async () => {
      const config: LogStepConfig = {
        id: 'test-log',
        type: 'log',
        message: 'User ${username} performed action',
        level: 'info',
        nextStepId: { default: 'next-step' },
      };

      const logStep = new LogStep(mockLogger, config);
      await logStep.execute(context);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'User ${username} performed action'
      );
    });

    it('should handle multiple placeholders', async () => {
      const config: LogStepConfig = {
        id: 'test-log',
        type: 'log',
        message:
          'Process ${process} completed with status ${status} at ${timestamp}',
        level: 'info',
        nextStepId: { default: 'next-step' },
      };

      context.set('process', 'backup');
      context.set('status', 'success');
      context.set('timestamp', '2023-01-01T10:00:00Z');

      const logStep = new LogStep(mockLogger, config);
      await logStep.execute(context);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Process backup completed with status success at 2023-01-01T10:00:00Z'
      );
    });
  });

  describe('routing', () => {
    it('should return next step from parent routing logic', async () => {
      const config: LogStepConfig = {
        id: 'test-log',
        type: 'log',
        message: 'Test message',
        level: 'info',
        nextStepId: { default: 'next-step' },
      };

      const logStep = new LogStep(mockLogger, config);
      const result = await logStep.execute(context);

      expect(result).toBe('next-step');
    });

    it('should handle empty nextStepId', async () => {
      const config: LogStepConfig = {
        id: 'test-log',
        type: 'log',
        message: 'Test message',
        level: 'info',
        nextStepId: {},
      };

      const logStep = new LogStep(mockLogger, config);
      const result = await logStep.execute(context);

      expect(result).toBeNull();
    });
  });

  describe('getConfig', () => {
    it('should return step configuration', () => {
      const config: LogStepConfig = {
        id: 'test-log',
        type: 'log',
        message: 'Test message',
        level: 'info',
        nextStepId: { default: 'next-step' },
      };

      const logStep = new LogStep(mockLogger, config);
      expect(logStep.getConfig()).toEqual(config);
    });
  });
});
