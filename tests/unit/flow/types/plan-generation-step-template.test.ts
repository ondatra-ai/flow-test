import 'reflect-metadata';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlanGenerationStep } from '../../../../src/flow/types/plan-generation-step.js';
import type { PlanGenerationStepConfig } from '../../../../src/types/validation/schemas.types.js';
// Import centralized mocks
import { expectMockCall } from '../../../test-utils/mock-validation/expect-mock-call.js';
import { createContextMock } from '../../mocks/flow/context-mock.js';
import { createLLMProviderMock } from '../../mocks/providers/llm-provider-mock.js';
import { createLoggerMock } from '../../mocks/utils/logger-mock.js';

describe('PlanGenerationStep - Template Handling', () => {
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

  describe('prompt template handling', () => {
    it('should use default prompt template when none provided', async () => {
      // Set up mocks with default issue context data
      const contextMock = createContextMock({
        setupBehavior: mocks => {
          mocks.get
            .mockReturnValueOnce('Issue Title') // github.issue.title
            .mockReturnValueOnce('Issue Body') // github.issue.body
            .mockReturnValueOnce('456') // github.issue.number
            .mockReturnValue(undefined); // All other calls
        },
      });
      const providerMock = createLLMProviderMock({
        defaultResponse: 'Generated plan',
      });
      const loggerMock = createLoggerMock();

      const step = new PlanGenerationStep(
        loggerMock.mock,
        providerMock.mock,
        mockConfig
      );

      await step.execute(contextMock.mock);

      // Verify the provider was called with expected prompt content
      const expectedPattern = new RegExp(
        'Generate a detailed execution plan[\\s\\S]*Title: Issue Title[\\s\\S]*' +
          'Description: Issue Body[\\s\\S]*1\\. Overview[\\s\\S]*' +
          'Format the response as markdown'
      );
      expectMockCall(providerMock.generate).toHaveBeenCalledWithContaining({
        prompt: expect.stringMatching(expectedPattern),
      });
    });

    it('should substitute template variables in custom prompt', async () => {
      // Set up mocks with default issue context data
      const contextMock = createContextMock({
        setupBehavior: mocks => {
          mocks.get
            .mockReturnValueOnce('Issue Title') // github.issue.title
            .mockReturnValueOnce('Issue Body') // github.issue.body
            .mockReturnValueOnce('456') // github.issue.number
            .mockReturnValue(undefined); // All other calls
        },
      });
      const providerMock = createLLMProviderMock({
        defaultResponse: 'Generated plan',
      });
      const loggerMock = createLoggerMock();

      const configWithTemplate: PlanGenerationStepConfig = {
        ...mockConfig,
        prompt_template:
          'Create plan for {{github.issue.title}} - {{github.issue.body}}',
      };

      const stepWithTemplate = new PlanGenerationStep(
        loggerMock.mock,
        providerMock.mock,
        configWithTemplate
      );

      await stepWithTemplate.execute(contextMock.mock);

      // Verify the provider was called with the substituted template
      expectMockCall(providerMock.generate).toHaveBeenCalledWithContaining({
        prompt: 'Create plan for Issue Title - Issue Body',
      });
    });

    it('should handle custom prompt template without variable substitution', async () => {
      // Set up mocks with default issue context data
      const contextMock = createContextMock({
        setupBehavior: mocks => {
          mocks.get
            .mockReturnValueOnce('Issue Title') // github.issue.title
            .mockReturnValueOnce('Issue Body') // github.issue.body
            .mockReturnValueOnce('456') // github.issue.number
            .mockReturnValue(undefined); // All other calls
        },
      });
      const providerMock = createLLMProviderMock({
        defaultResponse: 'Generated plan',
      });
      const loggerMock = createLoggerMock();

      const configWithTemplate: PlanGenerationStepConfig = {
        ...mockConfig,
        prompt_template: 'Simple prompt without variables',
      };

      const stepWithTemplate = new PlanGenerationStep(
        loggerMock.mock,
        providerMock.mock,
        configWithTemplate
      );

      await stepWithTemplate.execute(contextMock.mock);

      // Verify the provider was called with the template as-is
      expectMockCall(providerMock.generate).toHaveBeenCalledWithContaining({
        prompt: 'Simple prompt without variables',
      });
    });

    it('should handle empty issue title and body in template substitution', async () => {
      // Set up mocks with null/empty context data
      const contextMock = createContextMock({
        setupBehavior: mocks => {
          mocks.get
            .mockReturnValueOnce(null) // null title (becomes 'Unknown Issue')
            .mockReturnValueOnce(null) // null body (will become '')
            .mockReturnValueOnce('789') // issue number
            .mockReturnValue(undefined); // All other context.get calls
        },
      });
      const providerMock = createLLMProviderMock({
        defaultResponse: 'Generated plan',
      });
      const loggerMock = createLoggerMock();

      const configWithTemplate: PlanGenerationStepConfig = {
        ...mockConfig,
        prompt_template:
          'Title: {{github.issue.title}}, Body: {{github.issue.body}}',
      };

      const stepWithTemplate = new PlanGenerationStep(
        loggerMock.mock,
        providerMock.mock,
        configWithTemplate
      );

      await stepWithTemplate.execute(contextMock.mock);

      // Verify the provider was called with default values for null context
      expectMockCall(providerMock.generate).toHaveBeenCalledWithContaining({
        prompt: 'Title: Unknown Issue, Body: ',
      });
    });
  });
});
