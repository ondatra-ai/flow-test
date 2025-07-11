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

    it('should evaluate to true when context value matches expected value', async () => {
      vi.mocked(mockContext.get).mockReturnValue('active');

      const result = await decisionStep.execute(mockContext);

      expect(mockContext.get).toHaveBeenCalledWith('status');
      expect(mockContext.set).toHaveBeenCalledWith('nextStep', 'success');
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Executing DecisionStep with condition: context.status === "active"'
      );
      expect(result).toBe('success-step');
    });

    it('should evaluate to false when context value does not match', async () => {
      vi.mocked(mockContext.get).mockReturnValue('inactive');

      const result = await decisionStep.execute(mockContext);

      expect(mockContext.get).toHaveBeenCalledWith('status');
      expect(mockContext.set).toHaveBeenCalledWith('nextStep', 'failure');
      expect(result).toBe('failure-step');
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

      const result = await decisionStep.execute(mockContext);

      expect(mockContext.set).toHaveBeenCalledWith('nextStep', 'bug-flow');
      expect(result).toBe('bug-step');
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

    it('should evaluate to true when context value is different', async () => {
      vi.mocked(mockContext.get).mockReturnValue('active');

      const result = await decisionStep.execute(mockContext);

      expect(mockContext.get).toHaveBeenCalledWith('status');
      expect(mockContext.set).toHaveBeenCalledWith('nextStep', 'enabled');
      expect(result).toBe('enabled-step');
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
