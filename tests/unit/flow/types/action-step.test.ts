import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { IContext } from '../../../../src/flow/context.js';
import { ActionStep } from '../../../../src/flow/types/action-step.js';
import {
  StepType,
  type ActionStepConfig,
} from '../../../../src/flow/types/step-type.js';
import { Logger } from '../../../../src/utils/logger.js';

describe('ActionStep', () => {
  let mockLogger: Logger;
  let mockContext: IContext;
  let actionStep: ActionStep;

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

  describe('setContext operation', () => {
    beforeEach(() => {
      const config: ActionStepConfig = {
        id: 'test-action',
        type: StepType.ACTION,
        operation: 'setContext',
        key: 'testKey',
        value: 'testValue',
        nextStepId: { default: 'next' },
      };
      actionStep = new ActionStep(mockLogger, config);
    });

    it('should set context value and return default next step', async () => {
      const result = await actionStep.execute(mockContext);

      expect(mockContext.set).toHaveBeenCalledWith('testKey', 'testValue');
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Executing ActionStep: setContext on key 'testKey'"
      );
      expect(result).toBe('next');
    });

    it('should throw error for missing value', async () => {
      const config: ActionStepConfig = {
        id: 'test-action',
        type: StepType.ACTION,
        operation: 'setContext',
        key: 'testKey',
        nextStepId: { default: 'next' },
      };
      actionStep = new ActionStep(mockLogger, config);

      await expect(actionStep.execute(mockContext)).rejects.toThrow(
        'Value is required for setContext operation'
      );
    });
  });

  describe('updateContext operation', () => {
    beforeEach(() => {
      const config: ActionStepConfig = {
        id: 'test-action',
        type: StepType.ACTION,
        operation: 'updateContext',
        key: 'existingKey',
        value: 'updatedValue',
        nextStepId: { default: 'next' },
      };
      actionStep = new ActionStep(mockLogger, config);
    });

    it('should update existing context value', async () => {
      vi.mocked(mockContext.has).mockReturnValue(true);

      const result = await actionStep.execute(mockContext);

      expect(mockContext.has).toHaveBeenCalledWith('existingKey');
      expect(mockContext.set).toHaveBeenCalledWith(
        'existingKey',
        'updatedValue'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Executing ActionStep: updateContext on key 'existingKey'"
      );
      expect(result).toBe('next');
    });

    it('should throw error if key does not exist', async () => {
      vi.mocked(mockContext.has).mockReturnValue(false);

      await expect(actionStep.execute(mockContext)).rejects.toThrow(
        'Cannot update non-existent context key: existingKey'
      );
    });
  });

  describe('removeContext operation', () => {
    beforeEach(() => {
      const config: ActionStepConfig = {
        id: 'test-action',
        type: StepType.ACTION,
        operation: 'removeContext',
        key: 'keyToRemove',
        nextStepId: { default: 'next' },
      };
      actionStep = new ActionStep(mockLogger, config);
    });

    it('should remove existing context key', async () => {
      vi.mocked(mockContext.has).mockReturnValue(true);

      const result = await actionStep.execute(mockContext);

      expect(mockContext.has).toHaveBeenCalledWith('keyToRemove');
      expect(mockContext.delete).toHaveBeenCalledWith('keyToRemove');
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Executing ActionStep: removeContext on key 'keyToRemove'"
      );
      expect(result).toBe('next');
    });

    it('should skip removal if key does not exist', async () => {
      vi.mocked(mockContext.has).mockReturnValue(false);

      const result = await actionStep.execute(mockContext);

      expect(mockContext.has).toHaveBeenCalledWith('keyToRemove');
      expect(mockContext.delete).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Attempting to remove non-existent context key: keyToRemove'
      );
      expect(result).toBe('next');
    });
  });

  describe('complex nextStepId routing', () => {
    it('should return null when nextStepId is empty', async () => {
      const config: ActionStepConfig = {
        id: 'test-action',
        type: StepType.ACTION,
        operation: 'setContext',
        key: 'testKey',
        value: 'testValue',
        nextStepId: {},
      };
      actionStep = new ActionStep(mockLogger, config);

      const result = await actionStep.execute(mockContext);

      expect(result).toBeNull();
    });

    it('should handle multiple routing options', async () => {
      const config: ActionStepConfig = {
        id: 'test-action',
        type: StepType.ACTION,
        operation: 'setContext',
        key: 'testKey',
        value: 'testValue',
        nextStepId: {
          success: 'success-step',
          error: 'error-step',
          default: 'default-step',
        },
      };
      actionStep = new ActionStep(mockLogger, config);

      const result = await actionStep.execute(mockContext);

      // Should return default since ActionStep doesn't use conditional routing
      expect(result).toBe('default-step');
    });
  });

  describe('error handling', () => {
    it('should handle context operation errors gracefully', async () => {
      const config: ActionStepConfig = {
        id: 'test-action',
        type: StepType.ACTION,
        operation: 'setContext',
        key: 'testKey',
        value: 'testValue',
        nextStepId: { default: 'next' },
      };
      actionStep = new ActionStep(mockLogger, config);

      // Mock context.set to throw an error
      vi.mocked(mockContext.set).mockImplementation(() => {
        throw new Error('Context error');
      });

      await expect(actionStep.execute(mockContext)).rejects.toThrow(
        'Context error'
      );
    });
  });

  describe('getId method', () => {
    it('should return the step id', () => {
      const config: ActionStepConfig = {
        id: 'test-action-id',
        type: StepType.ACTION,
        operation: 'setContext',
        key: 'testKey',
        value: 'testValue',
        nextStepId: { default: 'next' },
      };
      actionStep = new ActionStep(mockLogger, config);

      expect(actionStep.getId()).toBe('test-action-id');
    });
  });
});
