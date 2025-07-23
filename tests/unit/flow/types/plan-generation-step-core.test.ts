import 'reflect-metadata';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlanGenerationStep } from '../../../../src/flow/types/plan-generation-step.js';
import type { PlanGenerationStepConfig } from '../../../../src/validation/index.js';
// Import centralized mocks
import {
  createContextMock,
  createLLMProviderMock,
  createLoggerMock,
} from '../../mocks/index.js';

describe('PlanGenerationStep - Core Functionality', () => {
  let mockConfig: PlanGenerationStepConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig = {
      id: 'test-plan-generation-step',
      type: 'plan-generation',
      model: 'gpt-4',
      llm_provider: 'openai',
      nextStepId: { default: 'next-step' },
    };
  });

  describe('constructor', () => {
    it('should create instance with valid parameters', () => {
      const loggerMock = createLoggerMock();
      const providerMock = createLLMProviderMock();

      const step = new PlanGenerationStep(
        loggerMock.mock,
        providerMock.mock,
        mockConfig
      );

      expect(step).toBeInstanceOf(PlanGenerationStep);
    });
  });

  describe('execute', () => {
    it('should call provider generate method with correct parameters', async () => {
      const contextMock = createContextMock();
      const providerMock = createLLMProviderMock({
        defaultResponse: 'Generated plan response',
      });
      const loggerMock = createLoggerMock();

      const step = new PlanGenerationStep(
        loggerMock.mock,
        providerMock.mock,
        mockConfig
      );

      await step.execute(contextMock.mock);

      expect(providerMock.generate).toHaveBeenCalledTimes(1);
      expect(loggerMock.info).toHaveBeenCalledWith(
        'Executing PlanGenerationStep: test-plan-generation-step'
      );
    });

    it('should use fresh mocks for each test', async () => {
      const freshContextMock = createContextMock();
      const freshProviderMock = createLLMProviderMock({
        defaultResponse: 'Fresh response',
      });
      const freshLoggerMock = createLoggerMock();

      const freshStep = new PlanGenerationStep(
        freshLoggerMock.mock,
        freshProviderMock.mock,
        mockConfig
      );

      await freshStep.execute(freshContextMock.mock);

      expect(freshProviderMock.generate).toHaveBeenCalledTimes(1);
      expect(freshLoggerMock.info).toHaveBeenCalledWith(
        'Executing PlanGenerationStep: test-plan-generation-step'
      );
    });
  });
});
