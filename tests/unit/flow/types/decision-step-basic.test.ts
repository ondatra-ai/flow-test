import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Context, IContext } from '../../../../src/flow/context.js';
import { DecisionStep } from '../../../../src/flow/types/decision-step.js';
import { cast } from '../../../../src/utils/cast.js';
import { Logger } from '../../../../src/utils/logger.js';
import { type DecisionStepConfig } from '../../../../src/validation/index.js';

describe('DecisionStep', () => {
  let mockLogger: Logger;
  let context: IContext;

  beforeEach(() => {
    mockLogger = cast<Logger>({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    });

    context = new Context();
  });

  describe('equals condition', () => {
    it('should return true step when condition is met', async () => {
      const config: DecisionStepConfig = {
        id: 'test-decision',
        type: 'decision',
        condition: 'equals',
        contextKey: 'testKey',
        trueValue: 'expectedValue',
        falseValue: 'otherValue',
        nextStepId: { true: 'true-step', false: 'false-step' },
      };

      context.set('testKey', 'expectedValue');

      const decisionStep = new DecisionStep(mockLogger, config);
      const result = await decisionStep.execute(context);

      expect(result).toBe('true-step');
    });

    it('should return false step when condition is not met', async () => {
      const config: DecisionStepConfig = {
        id: 'test-decision',
        type: 'decision',
        condition: 'equals',
        contextKey: 'testKey',
        trueValue: 'expectedValue',
        falseValue: 'otherValue',
        nextStepId: { true: 'true-step', false: 'false-step' },
      };

      context.set('testKey', 'actualValue');

      const decisionStep = new DecisionStep(mockLogger, config);
      const result = await decisionStep.execute(context);

      expect(result).toBe('false-step');
    });
  });

  describe('not_equals condition', () => {
    it('should return true step when values are different', async () => {
      const config: DecisionStepConfig = {
        id: 'test-decision',
        type: 'decision',
        condition: 'not_equals',
        contextKey: 'testKey',
        trueValue: 'excludedValue',
        falseValue: 'otherValue',
        nextStepId: { true: 'true-step', false: 'false-step' },
      };

      context.set('testKey', 'actualValue');

      const decisionStep = new DecisionStep(mockLogger, config);
      const result = await decisionStep.execute(context);

      expect(result).toBe('true-step');
    });
  });

  describe('missing context key', () => {
    it('should return false step when context key is missing', async () => {
      const config: DecisionStepConfig = {
        id: 'test-decision',
        type: 'decision',
        condition: 'equals',
        contextKey: 'missingKey',
        trueValue: 'expectedValue',
        falseValue: 'otherValue',
        nextStepId: { true: 'true-step', false: 'false-step' },
      };

      const decisionStep = new DecisionStep(mockLogger, config);
      const result = await decisionStep.execute(context);

      expect(result).toBe('false-step');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Context key 'missingKey' not found, treating as false"
      );
    });
  });

  describe('getConfig', () => {
    it('should return step configuration', () => {
      const config: DecisionStepConfig = {
        id: 'test-decision',
        type: 'decision',
        condition: 'equals',
        contextKey: 'testKey',
        trueValue: 'expectedValue',
        falseValue: 'otherValue',
        nextStepId: { true: 'true-step', false: 'false-step' },
      };

      const decisionStep = new DecisionStep(mockLogger, config);
      expect(decisionStep.getConfig()).toEqual(config);
    });
  });
});
