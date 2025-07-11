import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Context, IContext } from '../../../../src/flow/context.js';
import { ActionStep } from '../../../../src/flow/types/action-step.js';
import { Logger } from '../../../../src/utils/logger.js';
import { type ActionStepConfig } from '../../../../src/validation/index.js';

describe('ActionStep', () => {
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

  describe('setContext operation', () => {
    it('should set context value', async () => {
      const config: ActionStepConfig = {
        id: 'test-action',
        type: 'action',
        operation: 'setContext',
        key: 'testKey',
        value: 'testValue',
        nextStepId: { default: 'next-step' },
      };

      const actionStep = new ActionStep(mockLogger, config);
      await actionStep.execute(context);

      expect(context.get('testKey')).toBe('testValue');
    });

    it('should throw error if value is missing', async () => {
      const config: ActionStepConfig = {
        id: 'test-action',
        type: 'action',
        operation: 'setContext',
        key: 'testKey',
        nextStepId: { default: 'next-step' },
      };

      const actionStep = new ActionStep(mockLogger, config);

      await expect(actionStep.execute(context)).rejects.toThrow(
        'Value is required for setContext operation'
      );
    });
  });

  describe('updateContext operation', () => {
    it('should update existing context value', async () => {
      // Set initial value
      context.set('testKey', 'initialValue');

      const config: ActionStepConfig = {
        id: 'test-action',
        type: 'action',
        operation: 'updateContext',
        key: 'testKey',
        value: 'updatedValue',
        nextStepId: { default: 'next-step' },
      };

      const actionStep = new ActionStep(mockLogger, config);
      await actionStep.execute(context);

      expect(context.get('testKey')).toBe('updatedValue');
    });

    it('should throw error if context key does not exist', async () => {
      const config: ActionStepConfig = {
        id: 'test-action',
        type: 'action',
        operation: 'updateContext',
        key: 'nonExistentKey',
        value: 'newValue',
        nextStepId: { default: 'next-step' },
      };

      const actionStep = new ActionStep(mockLogger, config);

      await expect(actionStep.execute(context)).rejects.toThrow(
        'Cannot update non-existent context key: nonExistentKey'
      );
    });

    it('should throw error if value is missing', async () => {
      context.set('testKey', 'initialValue');

      const config: ActionStepConfig = {
        id: 'test-action',
        type: 'action',
        operation: 'updateContext',
        key: 'testKey',
        nextStepId: { default: 'next-step' },
      };

      const actionStep = new ActionStep(mockLogger, config);

      await expect(actionStep.execute(context)).rejects.toThrow(
        'Value is required for updateContext operation'
      );
    });
  });

  describe('removeContext operation', () => {
    it('should remove context value', async () => {
      // Set initial value
      context.set('testKey', 'testValue');

      const config: ActionStepConfig = {
        id: 'test-action',
        type: 'action',
        operation: 'removeContext',
        key: 'testKey',
        nextStepId: { default: 'next-step' },
      };

      const actionStep = new ActionStep(mockLogger, config);
      await actionStep.execute(context);

      expect(context.has('testKey')).toBe(false);
    });

    it('should log warning when removing non-existent key', async () => {
      const config: ActionStepConfig = {
        id: 'test-action',
        type: 'action',
        operation: 'removeContext',
        key: 'nonExistentKey',
        nextStepId: { default: 'next-step' },
      };

      const actionStep = new ActionStep(mockLogger, config);
      await actionStep.execute(context);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Attempting to remove non-existent context key: nonExistentKey'
      );
    });
  });

  describe('getConfig', () => {
    it('should return step configuration', () => {
      const config: ActionStepConfig = {
        id: 'test-action',
        type: 'action',
        operation: 'setContext',
        key: 'testKey',
        value: 'testValue',
        nextStepId: { default: 'next-step' },
      };

      const actionStep = new ActionStep(mockLogger, config);
      expect(actionStep.getConfig()).toEqual(config);
    });
  });
});
