import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { IContext } from '../../../../src/flow/context.js';
import { LogStep } from '../../../../src/flow/types/log-step.js';
import {
  StepType,
  type LogStepConfig,
} from '../../../../src/flow/types/step-type.js';
import { Logger } from '../../../../src/utils/logger.js';

describe('LogStep - Core Functionality', () => {
  let mockLogger: Logger;
  let mockContext: IContext;
  let logStep: LogStep;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    } as unknown as Logger;

    mockContext = {
      get: vi.fn(),
      set: vi.fn(),
      has: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
    } as unknown as IContext;
  });

  describe('basic logging functionality', () => {
    it('should log at info level by default', async () => {
      const config: LogStepConfig = {
        id: 'info-log',
        type: StepType.LOG,
        message: 'This is an info message',
        level: 'info',
        nextStepId: { default: 'next-step' },
      };
      logStep = new LogStep(mockLogger, config);

      const result = await logStep.execute(mockContext);

      expect(mockLogger.info).toHaveBeenCalledWith('This is an info message');
      expect(result).toBe('next-step');
    });

    it('should log at error level', async () => {
      const config: LogStepConfig = {
        id: 'error-log',
        type: StepType.LOG,
        message: 'This is an error message',
        level: 'error',
        nextStepId: { default: 'next-step' },
      };
      logStep = new LogStep(mockLogger, config);

      const result = await logStep.execute(mockContext);

      expect(mockLogger.error).toHaveBeenCalledWith('This is an error message');
      expect(result).toBe('next-step');
    });

    it('should log at warn level', async () => {
      const config: LogStepConfig = {
        id: 'warn-log',
        type: StepType.LOG,
        message: 'This is a warning message',
        level: 'warn',
        nextStepId: { default: 'next-step' },
      };
      logStep = new LogStep(mockLogger, config);

      const result = await logStep.execute(mockContext);

      expect(mockLogger.warn).toHaveBeenCalledWith('This is a warning message');
      expect(result).toBe('next-step');
    });

    it('should log at debug level', async () => {
      const config: LogStepConfig = {
        id: 'debug-log',
        type: StepType.LOG,
        message: 'This is a debug message',
        level: 'debug',
        nextStepId: { default: 'next-step' },
      };
      logStep = new LogStep(mockLogger, config);

      const result = await logStep.execute(mockContext);

      expect(mockLogger.debug).toHaveBeenCalledWith('This is a debug message');
      expect(result).toBe('next-step');
    });
  });

  describe('context interpolation', () => {
    it('should interpolate single context variable', async () => {
      const config: LogStepConfig = {
        id: 'interpolate-log',
        type: StepType.LOG,
        message: 'User {{context.username}} logged in',
        level: 'info',
        nextStepId: { default: 'next-step' },
      };
      logStep = new LogStep(mockLogger, config);

      vi.mocked(mockContext.get).mockReturnValue('john_doe');

      const result = await logStep.execute(mockContext);

      expect(mockContext.get).toHaveBeenCalledWith('username');
      expect(mockLogger.info).toHaveBeenCalledWith('User john_doe logged in');
      expect(result).toBe('next-step');
    });

    it('should handle undefined context variables', async () => {
      const config: LogStepConfig = {
        id: 'undefined-var-log',
        type: StepType.LOG,
        message: 'Missing variable: {{context.missingVar}}',
        level: 'info',
        nextStepId: { default: 'next-step' },
      };
      logStep = new LogStep(mockLogger, config);

      vi.mocked(mockContext.get).mockReturnValue(undefined);

      const result = await logStep.execute(mockContext);

      expect(mockContext.get).toHaveBeenCalledWith('missingVar');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Context variable not found: missingVar'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Missing variable: {{UNDEFINED:missingVar}}'
      );
      expect(result).toBe('next-step');
    });
  });

  describe('routing behavior', () => {
    it('should return null when nextStepId is empty', async () => {
      const config: LogStepConfig = {
        id: 'no-next-log',
        type: StepType.LOG,
        message: 'Final step',
        level: 'info',
        nextStepId: {},
      };
      logStep = new LogStep(mockLogger, config);

      const result = await logStep.execute(mockContext);

      expect(result).toBeNull();
    });

    it('should handle multiple routing options', async () => {
      const config: LogStepConfig = {
        id: 'multi-route-log',
        type: StepType.LOG,
        message: 'Routing message',
        level: 'info',
        nextStepId: {
          success: 'success-step',
          error: 'error-step',
          default: 'default-step',
        },
      };
      logStep = new LogStep(mockLogger, config);

      const result = await logStep.execute(mockContext);

      // LogStep uses default routing since it doesn't have conditional logic
      expect(result).toBe('default-step');
    });
  });

  describe('error handling', () => {
    it('should handle context access errors gracefully', async () => {
      const config: LogStepConfig = {
        id: 'context-error-log',
        type: StepType.LOG,
        message: 'User {{context.username}} action',
        level: 'info',
        nextStepId: { default: 'next-step' },
      };
      logStep = new LogStep(mockLogger, config);

      vi.mocked(mockContext.get).mockImplementation(() => {
        throw new Error('Context access error');
      });

      await expect(logStep.execute(mockContext)).rejects.toThrow(
        'Context access error'
      );
      expect(mockLogger.error).toHaveBeenCalledWith('LogStep failed', {
        message: 'User {{context.username}} action',
        level: 'info',
        error: 'Context access error',
      });
    });
  });

  describe('getInterpolatedMessage method', () => {
    it('should return interpolated message without executing the step', () => {
      const config: LogStepConfig = {
        id: 'interpolate-test',
        type: StepType.LOG,
        message: 'Hello {{context.name}}!',
        level: 'info',
        nextStepId: { default: 'next-step' },
      };
      logStep = new LogStep(mockLogger, config);

      vi.mocked(mockContext.get).mockReturnValue('World');

      const interpolatedMessage = logStep.getInterpolatedMessage(mockContext);

      expect(interpolatedMessage).toBe('Hello World!');
      expect(mockContext.get).toHaveBeenCalledWith('name');
      // Should not call any logger methods since we're not executing
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it('should handle undefined variables in getInterpolatedMessage', () => {
      const config: LogStepConfig = {
        id: 'interpolate-undefined-test',
        type: StepType.LOG,
        message: 'Value: {{context.missing}}',
        level: 'info',
        nextStepId: { default: 'next-step' },
      };
      logStep = new LogStep(mockLogger, config);

      vi.mocked(mockContext.get).mockReturnValue(undefined);

      const interpolatedMessage = logStep.getInterpolatedMessage(mockContext);

      expect(interpolatedMessage).toBe('Value: {{UNDEFINED:missing}}');
    });
  });

  describe('getConfig and getId methods', () => {
    it('should return the step configuration', () => {
      const config: LogStepConfig = {
        id: 'config-test',
        type: StepType.LOG,
        message: 'Test message',
        level: 'warn',
        nextStepId: { default: 'next-step' },
      };
      logStep = new LogStep(mockLogger, config);

      const returnedConfig = logStep.getConfig();
      expect(returnedConfig).toEqual(config);
    });

    it('should return the step id', () => {
      const config: LogStepConfig = {
        id: 'test-log-id',
        type: StepType.LOG,
        message: 'Test message',
        level: 'info',
        nextStepId: { default: 'next-step' },
      };
      logStep = new LogStep(mockLogger, config);

      expect(logStep.getId()).toBe('test-log-id');
    });
  });
});
