/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'reflect-metadata';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PlanGenerationStep } from '../../../../src/flow/types/plan-generation-step.js';
import type { PlanGenerationStepConfig } from '../../../../src/validation/index.js';
// Import centralized mocks
import {
  createContextMock,
  createLLMProviderMock,
  createLoggerMock,
} from '../../mocks/index.js';

describe('PlanGenerationStep - Provider Testing', () => {
  let mockConfig: PlanGenerationStepConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig = {
      id: 'test-plan-generation',
      type: 'plan-generation',
      llm_provider: 'claude',
      model: 'claude-sonnet-4-20250514',
      temperature: 0.8,
      max_tokens: 1500,
      nextStepId: { default: 'next-step' },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('LLM Provider Integration', () => {
    it('should call LLM provider with correct parameters', async () => {
      const loggerMock = createLoggerMock();
      const contextMock = createContextMock();
      const providerMock = createLLMProviderMock();

      const planGenerationStep = new PlanGenerationStep(
        loggerMock.mock,
        providerMock.mock,
        mockConfig
      );

      await planGenerationStep.execute(contextMock.mock);

      expect(providerMock.generate).toHaveBeenCalledWith({
        prompt: expect.any(String),
        signal: expect.any(AbortSignal),
        model: 'claude-sonnet-4-20250514',
        temperature: 0.8,
        maxTokens: 1500,
        messages: [
          {
            role: 'user',
            content: expect.any(String),
          },
        ],
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in issue title and body', async () => {
      const loggerMock = createLoggerMock();
      const contextMock = createContextMock();
      const providerMock = createLLMProviderMock({
        defaultResponse: 'Edge case result',
      });

      // Set up context mock behavior for special characters test
      contextMock.get
        .mockReturnValueOnce('Title with "quotes" & <tags>')
        .mockReturnValueOnce('Body with $pecial ch@rs!')
        .mockReturnValueOnce('999');

      const planGenerationStep = new PlanGenerationStep(
        loggerMock.mock,
        providerMock.mock,
        mockConfig
      );

      await planGenerationStep.execute(contextMock.mock);

      const callArgs = providerMock.generate.mock
        .calls[0][0] as import('../../../../src/interfaces/providers/index.js').StreamRequest;
      expect(callArgs.prompt).toContain('Title with "quotes" & <tags>');
      expect(callArgs.prompt).toContain('Body with $pecial ch@rs!');
    });

    it('should handle template variables with special regex characters', async () => {
      const loggerMock = createLoggerMock();
      const contextMock = createContextMock();
      const providerMock = createLLMProviderMock({
        defaultResponse: 'Template result',
      });

      // Set up context mock behavior for regex characters test
      contextMock.get
        .mockReturnValueOnce('Title with $1 and (parentheses)')
        .mockReturnValueOnce('Body with [brackets] and {braces}')
        .mockReturnValueOnce('111');

      const configWithTemplate: PlanGenerationStepConfig = {
        ...mockConfig,
        prompt_template:
          'Process: {{github.issue.title}} - Details: {{github.issue.body}}',
      };

      const stepWithTemplate = new PlanGenerationStep(
        loggerMock.mock,
        providerMock.mock,
        configWithTemplate
      );

      await stepWithTemplate.execute(contextMock.mock);

      const callArgs = providerMock.generate.mock
        .calls[0][0] as import('../../../../src/interfaces/providers/index.js').StreamRequest;
      expect(callArgs.prompt).toBe(
        'Process: Title with $1 and (parentheses) - Details: Body with [brackets] and {braces}'
      );
    });
  });
});
