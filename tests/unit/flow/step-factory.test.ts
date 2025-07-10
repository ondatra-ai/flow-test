import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { StepFactory } from '../../../src/flow/step-factory.js';
import { ActionStep } from '../../../src/flow/types/action-step.js';
import { DecisionStep } from '../../../src/flow/types/decision-step.js';
import { LogStep } from '../../../src/flow/types/log-step.js';
import { StepType } from '../../../src/flow/types/step-type.js';
import { Logger } from '../../../src/utils/logger.js';

// Mock the step classes
vi.mock('../../../src/flow/types/action-step.js');
vi.mock('../../../src/flow/types/decision-step.js');
vi.mock('../../../src/flow/types/log-step.js');

describe('StepFactory', () => {
  let stepFactory: StepFactory;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    } as unknown as Logger;

    stepFactory = new StepFactory(mockLogger);
    vi.clearAllMocks();
  });

  describe('createStep', () => {
    it('should create ActionStep for valid action step data', () => {
      const stepData = {
        id: 'test-action',
        type: 'action',
        operation: 'setContext',
        key: 'testKey',
        value: 'testValue',
        nextStepId: { default: 'next' },
      };

      stepFactory.createStep(stepData);

      expect(ActionStep).toHaveBeenCalledWith(
        mockLogger,
        expect.objectContaining({
          id: 'test-action',
          type: StepType.ACTION,
          operation: 'setContext',
          key: 'testKey',
          value: 'testValue',
          nextStepId: { default: 'next' },
        })
      );
    });

    it('should create DecisionStep for valid decision step data', () => {
      const stepData = {
        id: 'test-decision',
        type: 'decision',
        condition: 'context.value === "test"',
        contextKey: 'result',
        trueValue: 'success',
        falseValue: 'failure',
        nextStepId: { default: 'next' },
      };

      stepFactory.createStep(stepData);

      expect(DecisionStep).toHaveBeenCalledWith(
        mockLogger,
        expect.objectContaining({
          id: 'test-decision',
          type: StepType.DECISION,
          condition: 'context.value === "test"',
          contextKey: 'result',
          trueValue: 'success',
          falseValue: 'failure',
          nextStepId: { default: 'next' },
        })
      );
    });

    it('should create LogStep for valid log step data', () => {
      const stepData = {
        id: 'test-log',
        type: 'log',
        message: 'Test message',
        level: 'info',
        nextStepId: { default: 'next' },
      };

      stepFactory.createStep(stepData);

      expect(LogStep).toHaveBeenCalledWith(
        mockLogger,
        expect.objectContaining({
          id: 'test-log',
          type: StepType.LOG,
          message: 'Test message',
          level: 'info',
          nextStepId: { default: 'next' },
        })
      );
    });

    it('should handle case-insensitive step types', () => {
      const stepData = {
        id: 'test-action',
        type: 'ACTION',
        operation: 'setContext',
        key: 'testKey',
        value: 'testValue',
        nextStepId: { default: 'next' },
      };

      stepFactory.createStep(stepData);

      expect(ActionStep).toHaveBeenCalled();
    });

    it('should throw error for invalid step data structure', () => {
      expect(() => stepFactory.createStep(null)).toThrow(
        'Invalid step data structure'
      );
      expect(() => stepFactory.createStep('invalid')).toThrow(
        'Invalid step data structure'
      );
      expect(() => stepFactory.createStep([])).toThrow(
        'Invalid step data structure'
      );
    });

    it('should throw error for missing id field', () => {
      const stepData = {
        type: 'action',
        operation: 'setContext',
        key: 'testKey',
        nextStepId: { default: 'next' },
      };

      expect(() => stepFactory.createStep(stepData)).toThrow(
        "Step field 'id' must be a non-empty string"
      );
    });

    it('should throw error for missing nextStepId field', () => {
      const stepData = {
        id: 'test',
        type: 'action',
        operation: 'setContext',
        key: 'testKey',
      };

      expect(() => stepFactory.createStep(stepData)).toThrow(
        "Step field 'nextStepId' must be an object"
      );
    });

    it('should throw error for invalid step type', () => {
      const stepData = {
        id: 'test',
        type: 'invalid',
        nextStepId: { default: 'next' },
      };

      expect(() => stepFactory.createStep(stepData)).toThrow(
        'Invalid step type: invalid'
      );
    });

    it('should throw error for missing required ActionStep fields', () => {
      const stepDataMissingOperation = {
        id: 'test',
        type: 'action',
        key: 'testKey',
        nextStepId: { default: 'next' },
      };

      expect(() => stepFactory.createStep(stepDataMissingOperation)).toThrow(
        'test missing required field: operation'
      );

      const stepDataMissingKey = {
        id: 'test',
        type: 'action',
        operation: 'setContext',
        nextStepId: { default: 'next' },
      };

      expect(() => stepFactory.createStep(stepDataMissingKey)).toThrow(
        'test missing required field: key'
      );
    });

    it('should require value for ActionStep operations except removeContext', () => {
      const stepDataSetContext = {
        id: 'test',
        type: 'action',
        operation: 'setContext',
        key: 'testKey',
        nextStepId: { default: 'next' },
      };

      expect(() => stepFactory.createStep(stepDataSetContext)).toThrow(
        'test missing required field: value'
      );

      const stepDataRemoveContext = {
        id: 'test',
        type: 'action',
        operation: 'removeContext',
        key: 'testKey',
        nextStepId: { default: 'next' },
      };

      expect(() => stepFactory.createStep(stepDataRemoveContext)).not.toThrow();
    });

    it('should throw error for invalid ActionStep operation', () => {
      const stepData = {
        id: 'test',
        type: 'action',
        operation: 'invalidOperation',
        key: 'testKey',
        nextStepId: { default: 'next' },
      };

      expect(() => stepFactory.createStep(stepData)).toThrow(
        "test field 'operation' must be one of: setContext, updateContext, removeContext"
      );
    });

    it('should throw error for missing required DecisionStep fields', () => {
      const requiredFields = [
        'condition',
        'contextKey',
        'trueValue',
        'falseValue',
      ];

      requiredFields.forEach(field => {
        const stepData = {
          id: 'test',
          type: 'decision',
          condition: 'test',
          contextKey: 'key',
          trueValue: 'true',
          falseValue: 'false',
          nextStepId: { default: 'next' },
        };

        delete stepData[field as keyof typeof stepData];

        expect(() => stepFactory.createStep(stepData)).toThrow(
          `test missing required field: ${field}`
        );
      });
    });

    it('should throw error for missing required LogStep fields', () => {
      const stepDataMissingMessage = {
        id: 'test',
        type: 'log',
        level: 'info',
        nextStepId: { default: 'next' },
      };

      expect(() => stepFactory.createStep(stepDataMissingMessage)).toThrow(
        'test missing required field: message'
      );

      const stepDataMissingLevel = {
        id: 'test',
        type: 'log',
        message: 'test message',
        nextStepId: { default: 'next' },
      };

      expect(() => stepFactory.createStep(stepDataMissingLevel)).toThrow(
        'test missing required field: level'
      );
    });

    it('should throw error for invalid LogStep level', () => {
      const stepData = {
        id: 'test',
        type: 'log',
        message: 'test message',
        level: 'invalid',
        nextStepId: { default: 'next' },
      };

      expect(() => stepFactory.createStep(stepData)).toThrow(
        "test field 'level' must be one of: info, warn, error, debug"
      );
    });
  });
});
