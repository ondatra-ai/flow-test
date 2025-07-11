import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Context, IContext } from '../../../../src/flow/context.js';
import { DecisionStep } from '../../../../src/flow/types/decision-step.js';
import { Logger } from '../../../../src/utils/logger.js';
import { type DecisionStepConfig } from '../../../../src/validation/index.js';

describe('DecisionStep - Equality Conditions', () => {
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

  describe('equals condition', () => {
    it('should handle string equality', async () => {
      const config: DecisionStepConfig = {
        id: 'equality-test',
        type: 'decision',
        condition: 'equals',
        contextKey: 'status',
        trueValue: 'active',
        falseValue: 'inactive',
        nextStepId: { true: 'active-step', false: 'inactive-step' },
      };

      context.set('status', 'active');

      const decisionStep = new DecisionStep(mockLogger, config);
      const result = await decisionStep.execute(context);

      expect(result).toBe('active-step');
    });

    it('should handle number comparison as strings', async () => {
      const config: DecisionStepConfig = {
        id: 'number-test',
        type: 'decision',
        condition: 'equals',
        contextKey: 'count',
        trueValue: '5',
        falseValue: 'other',
        nextStepId: { true: 'match-step', false: 'nomatch-step' },
      };

      context.set('count', '5'); // Set as string

      const decisionStep = new DecisionStep(mockLogger, config);
      const result = await decisionStep.execute(context);

      expect(result).toBe('match-step');
    });
  });

  describe('contains condition', () => {
    it('should return true when string contains substring', async () => {
      const config: DecisionStepConfig = {
        id: 'contains-test',
        type: 'decision',
        condition: 'contains',
        contextKey: 'message',
        trueValue: 'error',
        falseValue: 'other',
        nextStepId: { true: 'error-step', false: 'normal-step' },
      };

      context.set('message', 'This is an error message');

      const decisionStep = new DecisionStep(mockLogger, config);
      const result = await decisionStep.execute(context);

      expect(result).toBe('error-step');
    });

    it('should return false when string does not contain substring', async () => {
      const config: DecisionStepConfig = {
        id: 'contains-test',
        type: 'decision',
        condition: 'contains',
        contextKey: 'message',
        trueValue: 'warning',
        falseValue: 'other',
        nextStepId: { true: 'warning-step', false: 'normal-step' },
      };

      context.set('message', 'This is an info message');

      const decisionStep = new DecisionStep(mockLogger, config);
      const result = await decisionStep.execute(context);

      expect(result).toBe('normal-step');
    });
  });

  describe('empty condition', () => {
    it('should return true when string is empty', async () => {
      const config: DecisionStepConfig = {
        id: 'empty-test',
        type: 'decision',
        condition: 'empty',
        contextKey: 'input',
        trueValue: 'empty',
        falseValue: 'not-empty',
        nextStepId: { true: 'empty-step', false: 'filled-step' },
      };

      context.set('input', '');

      const decisionStep = new DecisionStep(mockLogger, config);
      const result = await decisionStep.execute(context);

      expect(result).toBe('empty-step');
    });

    it('should return false when string is not empty', async () => {
      const config: DecisionStepConfig = {
        id: 'empty-test',
        type: 'decision',
        condition: 'empty',
        contextKey: 'input',
        trueValue: 'empty',
        falseValue: 'not-empty',
        nextStepId: { true: 'empty-step', false: 'filled-step' },
      };

      context.set('input', 'some value');

      const decisionStep = new DecisionStep(mockLogger, config);
      const result = await decisionStep.execute(context);

      expect(result).toBe('filled-step');
    });
  });

  describe('not_contains condition', () => {
    it('should return true when string does not contain substring', async () => {
      const config: DecisionStepConfig = {
        id: 'not-contains-test',
        type: 'decision',
        condition: 'not_contains',
        contextKey: 'message',
        trueValue: 'error',
        falseValue: 'other',
        nextStepId: { true: 'safe-step', false: 'error-step' },
      };

      context.set('message', 'This is a normal message');

      const decisionStep = new DecisionStep(mockLogger, config);
      const result = await decisionStep.execute(context);

      expect(result).toBe('safe-step');
    });

    it('should return false when string contains substring', async () => {
      const config: DecisionStepConfig = {
        id: 'not-contains-test',
        type: 'decision',
        condition: 'not_contains',
        contextKey: 'message',
        trueValue: 'error',
        falseValue: 'other',
        nextStepId: { true: 'safe-step', false: 'error-step' },
      };

      context.set('message', 'This is an error message');

      const decisionStep = new DecisionStep(mockLogger, config);
      const result = await decisionStep.execute(context);

      expect(result).toBe('error-step');
    });
  });

  describe('not_empty condition', () => {
    it('should return true when string is not empty', async () => {
      const config: DecisionStepConfig = {
        id: 'not-empty-test',
        type: 'decision',
        condition: 'not_empty',
        contextKey: 'input',
        trueValue: 'not-empty',
        falseValue: 'empty',
        nextStepId: { true: 'filled-step', false: 'empty-step' },
      };

      context.set('input', 'some value');

      const decisionStep = new DecisionStep(mockLogger, config);
      const result = await decisionStep.execute(context);

      expect(result).toBe('filled-step');
    });

    it('should return false when string is empty', async () => {
      const config: DecisionStepConfig = {
        id: 'not-empty-test',
        type: 'decision',
        condition: 'not_empty',
        contextKey: 'input',
        trueValue: 'not-empty',
        falseValue: 'empty',
        nextStepId: { true: 'filled-step', false: 'empty-step' },
      };

      context.set('input', '');

      const decisionStep = new DecisionStep(mockLogger, config);
      const result = await decisionStep.execute(context);

      expect(result).toBe('empty-step');
    });
  });

  describe('unknown condition error', () => {
    it('should throw an error for unknown condition types', async () => {
      const config = {
        id: 'unknown-test',
        type: 'decision',
        condition: 'unknown_condition',
        contextKey: 'value',
        trueValue: 'test',
        falseValue: 'other',
        nextStepId: { true: 'match-step', false: 'nomatch-step' },
      } as DecisionStepConfig;

      context.set('value', 'test');

      const decisionStep = new DecisionStep(mockLogger, config);

      await expect(decisionStep.execute(context)).rejects.toThrow(
        'Unknown condition type: unknown_condition'
      );
    });
  });
});
