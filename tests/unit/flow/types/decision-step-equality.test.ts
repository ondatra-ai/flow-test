import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { IContext } from '../../../../src/flow/context.js';
import { DecisionStep } from '../../../../src/flow/types/decision-step.js';
import {
  StepType,
  type DecisionStepConfig,
} from '../../../../src/flow/types/step-type.js';
import { Logger } from '../../../../src/utils/logger.js';

describe('DecisionStep - Equality Conditions', () => {
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
      vi.mocked(mockContext.get).mockImplementation((key: string) =>
        key === 'status' ? 'active' : key === 'nextStep' ? 'success' : undefined
      );

      await decisionStep.execute(mockContext);

      expect(mockContext.get).toHaveBeenCalledWith('status');
      expect(mockContext.set).toHaveBeenCalledWith('nextStep', 'success');
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Executing DecisionStep with condition: context.status === "active"'
      );
    });

    it('should set context to falseValue when condition evaluates to false', async () => {
      vi.mocked(mockContext.get).mockImplementation((key: string) =>
        key === 'status'
          ? 'inactive'
          : key === 'nextStep'
            ? 'failure'
            : undefined
      );

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
        nextStepId: {
          'bug-flow': 'bug-step',
          'feature-flow': 'feature-step',
          default: 'default-step',
        },
      };
      decisionStep = new DecisionStep(mockLogger, config);
      vi.mocked(mockContext.get).mockImplementation((key: string) =>
        key === 'type' ? 'bug' : key === 'nextStep' ? 'bug-flow' : undefined
      );

      await decisionStep.execute(mockContext);

      expect(mockContext.set).toHaveBeenCalledWith('nextStep', 'bug-flow');
    });
  });
});
