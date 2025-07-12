import 'reflect-metadata';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StepFactory } from '../../../src/flow/step-factory.js';
import { ActionStep } from '../../../src/flow/types/action-step.js';
import { DecisionStep } from '../../../src/flow/types/decision-step.js';
import { LogStep } from '../../../src/flow/types/log-step.js';
import { cast } from '../../../src/utils/cast.js';
import { GitHubClient } from '../../../src/utils/github-client.js';
import { Logger } from '../../../src/utils/logger.js';
import { type StepConfig } from '../../../src/validation/index.js';

describe('StepFactory', () => {
  let stepFactory: StepFactory;
  let mockLogger: Logger;
  let mockGitHubClient: GitHubClient;

  beforeEach(() => {
    mockLogger = cast<Logger>({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    });

    mockGitHubClient = cast<GitHubClient>({
      getIssueWithComments: vi.fn(),
    });

    stepFactory = new StepFactory(mockLogger, mockGitHubClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createStep', () => {
    it('should create ActionStep for action type', () => {
      const stepData: StepConfig = {
        id: 'action-step',
        type: 'action',
        operation: 'setContext',
        key: 'testKey',
        value: 'testValue',
        nextStepId: { default: 'next-step' },
      };

      const step = stepFactory.createStep(stepData);

      expect(step).toBeInstanceOf(ActionStep);
      expect(step.getId()).toBe('action-step');
    });

    it('should create DecisionStep for decision type', () => {
      const stepData: StepConfig = {
        id: 'decision-step',
        type: 'decision',
        condition: 'equals',
        contextKey: 'testKey',
        trueValue: 'true',
        falseValue: 'false',
        nextStepId: { true: 'true-step', false: 'false-step' },
      };

      const step = stepFactory.createStep(stepData);

      expect(step).toBeInstanceOf(DecisionStep);
      expect(step.getId()).toBe('decision-step');
    });

    it('should create LogStep for log type', () => {
      const stepData: StepConfig = {
        id: 'log-step',
        type: 'log',
        message: 'Test log message',
        level: 'info',
        nextStepId: { default: 'next-step' },
      };

      const step = stepFactory.createStep(stepData);

      expect(step).toBeInstanceOf(LogStep);
      expect(step.getId()).toBe('log-step');
    });

    it('should handle case-insensitive step types', () => {
      const stepData = cast<StepConfig>({
        id: 'action-step',
        type: 'ACTION',
        operation: 'setContext',
        key: 'testKey',
        value: 'testValue',
        nextStepId: { default: 'next-step' },
      });

      const step = stepFactory.createStep(stepData);

      expect(step).toBeInstanceOf(ActionStep);
      expect(step.getId()).toBe('action-step');
    });

    it('should throw error for invalid step data', () => {
      const invalidStepData = cast<StepConfig>({
        id: 'invalid-step',
        type: 'invalid',
        nextStepId: { default: 'next-step' },
      });

      expect(() => stepFactory.createStep(invalidStepData)).toThrow(
        /Validation failed/
      );
    });

    it('should throw error for missing required fields', () => {
      const invalidStepData = cast<StepConfig>({
        type: 'action',
      });

      expect(() => stepFactory.createStep(invalidStepData)).toThrow(
        /Validation failed/
      );
    });
  });
});
