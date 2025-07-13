import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Context, IContext } from '../../../../src/flow/context.js';
import { LogStep } from '../../../../src/flow/types/log-step.js';
import { cast } from '../../../../src/utils/cast.js';
import { Logger } from '../../../../src/utils/logger.js';
import { type LogStepConfig } from '../../../../src/validation/index.js';

describe('LogStep', () => {
  let mockLogger: Logger;
  let context: IContext;

  beforeEach(() => {
    mockLogger = cast<Logger>({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      log: vi.fn(),
    });

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

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Executing LogStep: Test info message'
      );
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

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Executing LogStep: Test error message'
      );
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

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Executing LogStep: Test warning message'
      );
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

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Executing LogStep: Test debug message'
      );
    });
  });

  describe('raw message output', () => {
    it('should output raw message without context processing', async () => {
      const config: LogStepConfig = {
        id: 'test-log',
        type: 'log',
        message:
          'User {{context.username}} logged in from {{context.location}}',
        level: 'info',
        nextStepId: { default: 'next-step' },
      };

      context.set('username', 'john');
      context.set('location', 'New York');

      const logStep = new LogStep(mockLogger, config);
      await logStep.execute(context);

      // Should output raw message without context placeholder resolution
      expect(mockLogger.log).toHaveBeenCalledWith(
        'User {{context.username}} logged in from {{context.location}}'
      );
    });

    it('should output raw message even with undefined context keys', async () => {
      const config: LogStepConfig = {
        id: 'test-log',
        type: 'log',
        message: 'User {{context.username}} performed action',
        level: 'info',
        nextStepId: { default: 'next-step' },
      };

      const logStep = new LogStep(mockLogger, config);
      await logStep.execute(context);

      // Should output raw template string without processing
      expect(mockLogger.log).toHaveBeenCalledWith(
        'User {{context.username}} performed action'
      );
    });

    it('should output raw message with multiple placeholders', async () => {
      const config: LogStepConfig = {
        id: 'test-log',
        type: 'log',
        message:
          'Process {{context.process}} completed with status {{context.status}} at {{context.timestamp}}',
        level: 'info',
        nextStepId: { default: 'next-step' },
      };

      context.set('process', 'backup');
      context.set('status', 'success');
      context.set('timestamp', '2023-01-01T10:00:00Z');

      const logStep = new LogStep(mockLogger, config);
      await logStep.execute(context);

      // Should output raw template string without context substitution
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Process {{context.process}} completed with status {{context.status}} at {{context.timestamp}}'
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

  describe('error handling', () => {
    it('should handle errors during execution and log them properly', async () => {
      const config: LogStepConfig = {
        id: 'test-log',
        type: 'log',
        message: 'Test message',
        level: 'info',
        nextStepId: { default: 'next-step' },
      };

      // Create a logger that throws an error on log call
      const errorLogger = cast<Logger>({
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        log: vi.fn().mockImplementation(() => {
          throw new Error('Logger failed');
        }),
      });

      const logStep = new LogStep(errorLogger, config);

      // Expect the error to be thrown and properly logged
      await expect(logStep.execute(context)).rejects.toThrow('Logger failed');

      // Check that the error was logged with proper context
      expect(errorLogger.error).toHaveBeenCalledWith(
        'LogStep failed',
        expect.any(Error),
        {
          message: 'Test message',
          level: 'info',
        }
      );
    });

    it('should handle errors with different log levels', async () => {
      const config: LogStepConfig = {
        id: 'test-log',
        type: 'log',
        message: 'Error test message',
        level: 'error',
        nextStepId: { default: 'next-step' },
      };

      // Create a logger that throws an error on log call
      const errorLogger = cast<Logger>({
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        log: vi.fn().mockImplementation(() => {
          throw new Error('Logger system failure');
        }),
      });

      const logStep = new LogStep(errorLogger, config);

      await expect(logStep.execute(context)).rejects.toThrow(
        'Logger system failure'
      );

      // Check that the error was logged with error level context
      expect(errorLogger.error).toHaveBeenCalledWith(
        'LogStep failed',
        expect.any(Error),
        {
          message: 'Error test message',
          level: 'error',
        }
      );
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
