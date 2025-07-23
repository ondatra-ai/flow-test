import 'reflect-metadata';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PlanGenerationStep } from '../../../../src/flow/types/plan-generation-step.js';
import type { StreamRequest } from '../../../../src/interfaces/providers/index.js';
import type { PlanGenerationStepConfig } from '../../../../src/validation/index.js';
// Import centralized mocks
import {
  createContextMock,
  createLLMProviderMock,
  createLoggerMock,
} from '../../mocks/index.js';

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

      const callArgs = providerMock.generate.mock.calls[0][0] as StreamRequest;
      expect(callArgs.prompt).toContain('Generate a detailed execution plan');
      expect(callArgs.prompt).toContain('Title: Issue Title');
      expect(callArgs.prompt).toContain('Description: Issue Body');
      expect(callArgs.prompt).toContain('1. Overview');
      expect(callArgs.prompt).toContain('Format the response as markdown');
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

      const callArgs = providerMock.generate.mock.calls[0][0] as StreamRequest;
      expect(callArgs.prompt).toBe('Create plan for Issue Title - Issue Body');
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

      const callArgs = providerMock.generate.mock.calls[0][0] as StreamRequest;
      expect(callArgs.prompt).toBe('Simple prompt without variables');
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

      const callArgs = providerMock.generate.mock.calls[0][0] as StreamRequest;
      // null values get converted to 'Unknown Issue' and ''
      expect(callArgs.prompt).toBe('Title: Unknown Issue, Body: ');
    });
  });
});
