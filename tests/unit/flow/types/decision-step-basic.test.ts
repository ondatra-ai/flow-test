import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { IContext } from '../../../../src/flow/context.js';
import { DecisionStep } from '../../../../src/flow/types/decision-step.js';
import {
  StepType,
  type DecisionStepConfig,
} from '../../../../src/flow/types/step-type.js';
import { Logger } from '../../../../src/utils/logger.js';

describe('DecisionStep - Basic Conditions', () => {
  let mockLogger: Logger;
  let mockContext: IContext;
  let decisionStep: DecisionStep;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    } as unknown as Logger;

    // Create a context that tracks set values
    const contextStorage = new Map<string, string>();
    mockContext = {
      get: vi.fn((key: string) => contextStorage.get(key)),
      set: vi.fn((key: string, value: string) =>
        contextStorage.set(key, value)
      ),
      has: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
    } as unknown as IContext;
  });

  describe('equality condition (===)', () => {
    beforeEach(() => {
      const config: DecisionStepConfig = {
        id: 'equality-decision',
        type: StepType.DECISION,
        condition: 'context.status === "active"',
        contextKey: 'nextStep',
        trueValue: 'success',
        falseValue: 'failure',
        nextStepId: {
          success: 'success-step',
          failure: 'failure-step',
          default: 'default-step',
        },
      };
      decisionStep = new DecisionStep(mockLogger, config);
    });

    it('should set context to trueValue when condition evaluates to true', async () => {
      vi.mocked(mockContext.get).mockReturnValue('active');

      await decisionStep.execute(mockContext);

      expect(mockContext.get).toHaveBeenCalledWith('status');
      expect(mockContext.set).toHaveBeenCalledWith('nextStep', 'success');
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Executing DecisionStep with condition: context.status === "active"'
      );
    });

    it('should set context to falseValue when condition evaluates to false', async () => {
      vi.mocked(mockContext.get).mockReturnValue('inactive');

      await decisionStep.execute(mockContext);

      expect(mockContext.get).toHaveBeenCalledWith('status');
      expect(mockContext.set).toHaveBeenCalledWith('nextStep', 'failure');
    });

    it('should handle quoted values in condition', async () => {
      const config: DecisionStepConfig = {
        id: 'quoted-decision',
        type: StepType.DECISION,
        condition: "context.type === 'bug'",
        contextKey: 'nextStep',
        trueValue: 'bug-flow',
        falseValue: 'feature-flow',
        nextStepId: { 'bug-flow': 'bug-step', 'feature-flow': 'feature-step' },
      };
      decisionStep = new DecisionStep(mockLogger, config);
      vi.mocked(mockContext.get).mockReturnValue('bug');

      await decisionStep.execute(mockContext);

      expect(mockContext.set).toHaveBeenCalledWith('nextStep', 'bug-flow');
    });
  });

  describe('inequality condition (!==)', () => {
    beforeEach(() => {
      const config: DecisionStepConfig = {
        id: 'inequality-decision',
        type: StepType.DECISION,
        condition: 'context.status !== "disabled"',
        contextKey: 'nextStep',
        trueValue: 'enabled',
        falseValue: 'disabled',
        nextStepId: {
          enabled: 'enabled-step',
          disabled: 'disabled-step',
        },
      };
      decisionStep = new DecisionStep(mockLogger, config);
    });

    it('should set context to trueValue when context value is different', async () => {
      vi.mocked(mockContext.get).mockReturnValue('active');

      await decisionStep.execute(mockContext);

      expect(mockContext.get).toHaveBeenCalledWith('status');
      expect(mockContext.set).toHaveBeenCalledWith('nextStep', 'enabled');
    });

    it('should evaluate to false when context value matches', async () => {
      vi.mocked(mockContext.get).mockReturnValue('disabled');

      const result = await decisionStep.execute(mockContext);

      expect(mockContext.set).toHaveBeenCalledWith('nextStep', 'disabled');
      expect(result).toBe('disabled-step');
    });
  });

  describe('existence condition (exists)', () => {
    beforeEach(() => {
      const config: DecisionStepConfig = {
        id: 'existence-decision',
        type: StepType.DECISION,
        condition: 'context.token exists',
        contextKey: 'nextStep',
        trueValue: 'authenticated',
        falseValue: 'unauthenticated',
        nextStepId: {
          authenticated: 'auth-step',
          unauthenticated: 'unauth-step',
        },
      };
      decisionStep = new DecisionStep(mockLogger, config);
    });

    it('should evaluate to true when context key exists', async () => {
      vi.mocked(mockContext.has).mockReturnValue(true);

      const result = await decisionStep.execute(mockContext);

      expect(mockContext.has).toHaveBeenCalledWith('token');
      expect(mockContext.set).toHaveBeenCalledWith('nextStep', 'authenticated');
      expect(result).toBe('auth-step');
    });

    it('should evaluate to false when context key does not exist', async () => {
      vi.mocked(mockContext.has).mockReturnValue(false);

      const result = await decisionStep.execute(mockContext);

      expect(mockContext.has).toHaveBeenCalledWith('token');
      expect(mockContext.set).toHaveBeenCalledWith(
        'nextStep',
        'unauthenticated'
      );
      expect(result).toBe('unauth-step');
    });
  });

  describe('condition evaluation edge cases', () => {
    it('should handle unquoted values in equality conditions', async () => {
      const config: DecisionStepConfig = {
        id: 'unquoted-decision',
        type: StepType.DECISION,
        condition: 'context.level === level1',
        contextKey: 'nextStep',
        trueValue: 'level1',
        falseValue: 'other',
        nextStepId: { level1: 'level1-step', other: 'other-step' },
      };
      decisionStep = new DecisionStep(mockLogger, config);
      vi.mocked(mockContext.get).mockReturnValue('level1');

      await decisionStep.execute(mockContext);

      expect(mockContext.set).toHaveBeenCalledWith('nextStep', 'level1');
    });

    it('should handle empty context values in conditions', async () => {
      const config: DecisionStepConfig = {
        id: 'empty-decision',
        type: StepType.DECISION,
        condition: 'context.value === ""',
        contextKey: 'nextStep',
        trueValue: 'empty',
        falseValue: 'not-empty',
        nextStepId: { empty: 'empty-step', 'not-empty': 'not-empty-step' },
      };
      decisionStep = new DecisionStep(mockLogger, config);
      vi.mocked(mockContext.get).mockReturnValue('');

      await decisionStep.execute(mockContext);

      expect(mockContext.set).toHaveBeenCalledWith('nextStep', 'empty');
    });

    it('should throw error for unsupported condition format', async () => {
      const config: DecisionStepConfig = {
        id: 'invalid-decision',
        type: StepType.DECISION,
        condition: 'context.value > 5',
        contextKey: 'nextStep',
        trueValue: 'greater',
        falseValue: 'lesser',
        nextStepId: { greater: 'greater-step', lesser: 'lesser-step' },
      };
      decisionStep = new DecisionStep(mockLogger, config);

      await expect(decisionStep.execute(mockContext)).rejects.toThrow(
        'Failed to evaluate condition: context.value > 5'
      );
    });

    it('should throw error for invalid condition format without context reference', async () => {
      const config: DecisionStepConfig = {
        id: 'no-context-decision',
        type: StepType.DECISION,
        condition: 'somevalue === "test"',
        contextKey: 'nextStep',
        trueValue: 'match',
        falseValue: 'no-match',
        nextStepId: { match: 'match-step', 'no-match': 'no-match-step' },
      };
      decisionStep = new DecisionStep(mockLogger, config);

      await expect(decisionStep.execute(mockContext)).rejects.toThrow(
        'Failed to evaluate condition: somevalue === "test"'
      );
    });
  });

  describe('getConfig method', () => {
    it('should return the step configuration', () => {
      const config: DecisionStepConfig = {
        id: 'config-test',
        type: StepType.DECISION,
        condition: 'context.test === "value"',
        contextKey: 'nextStep',
        trueValue: 'true',
        falseValue: 'false',
        nextStepId: { true: 'true-step', false: 'false-step' },
      };
      decisionStep = new DecisionStep(mockLogger, config);

      const returnedConfig = decisionStep.getConfig();

      expect(returnedConfig).toEqual(config);
    });
  });

  describe('getId method', () => {
    it('should return the step id', () => {
      const config: DecisionStepConfig = {
        id: 'test-decision-id',
        type: StepType.DECISION,
        condition: 'context.test === "value"',
        contextKey: 'nextStep',
        trueValue: 'true',
        falseValue: 'false',
        nextStepId: { true: 'true-step', false: 'false-step' },
      };
      decisionStep = new DecisionStep(mockLogger, config);

      expect(decisionStep.getId()).toBe('test-decision-id');
    });
  });
});
