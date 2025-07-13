/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'reflect-metadata';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockedFunction,
} from 'vitest';

import type { IContext } from '../../../../src/flow/context.js';
import { PlanGenerationStep } from '../../../../src/flow/types/plan-generation-step.js';
import type {
  ILLMProvider,
  StreamRequest,
} from '../../../../src/interfaces/providers/index.js';
import { cast } from '../../../../src/utils/cast.js';
import { Logger } from '../../../../src/utils/logger.js';
import type { PlanGenerationStepConfig } from '../../../../src/validation/index.js';

// Mock logger functions
const mockLoggerInfo = vi.fn();
const mockLoggerError = vi.fn();
const mockLoggerWarn = vi.fn();
const mockLoggerDebug = vi.fn();

const mockLogger = cast<Logger>({
  info: mockLoggerInfo,
  error: mockLoggerError,
  warn: mockLoggerWarn,
  debug: mockLoggerDebug,
});

// Mock LLM provider functions
const mockGenerate = vi.fn();
const mockGetProviderName = vi.fn();

const mockLLMProvider = cast<ILLMProvider>({
  generate: mockGenerate,
  getProviderName: mockGetProviderName,
});

// Mock context functions
const mockContextGet = vi.fn();
const mockContextSet = vi.fn();

const mockContext = cast<IContext>({
  get: mockContextGet,
  set: mockContextSet,
});

describe('PlanGenerationStep - Providers & Edge Cases', () => {
  let planGenerationStep: PlanGenerationStep;
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

    planGenerationStep = new PlanGenerationStep(
      mockLogger,
      mockLLMProvider,
      mockConfig
    );
  });

  describe('different LLM provider configurations', () => {
    beforeEach(() => {
      mockGenerate.mockResolvedValue('Plan result');
      mockContextGet.mockReturnValue('Test data');
    });

    it('should handle OpenAI provider configuration', async () => {
      const openaiConfig: PlanGenerationStepConfig = {
        id: 'openai-step',
        type: 'plan-generation',
        llm_provider: 'openai',
        model: 'gpt-4',
        temperature: 0.5,
        max_tokens: 3000,
        nextStepId: {},
      };

      const openaiStep = new PlanGenerationStep(
        mockLogger,
        mockLLMProvider,
        openaiConfig
      );

      await openaiStep.execute(mockContext);

      expect(mockGenerate).toHaveBeenCalledWith({
        prompt: expect.any(String),
        signal: expect.any(AbortSignal),
        model: 'gpt-4',
        temperature: 0.5,
        maxTokens: 3000,
        messages: [
          {
            role: 'user',
            content: expect.any(String),
          },
        ],
      });
    });

    it('should handle Gemini provider configuration', async () => {
      const geminiConfig: PlanGenerationStepConfig = {
        id: 'gemini-step',
        type: 'plan-generation',
        llm_provider: 'gemini',
        model: 'gemini-pro',
        temperature: 1.0,
        max_tokens: 4000,
        nextStepId: {},
      };

      const geminiStep = new PlanGenerationStep(
        mockLogger,
        mockLLMProvider,
        geminiConfig
      );

      await geminiStep.execute(mockContext);

      expect(mockGenerate).toHaveBeenCalledWith({
        prompt: expect.any(String),
        signal: expect.any(AbortSignal),
        model: 'gemini-pro',
        temperature: 1.0,
        maxTokens: 4000,
        messages: [
          {
            role: 'user',
            content: expect.any(String),
          },
        ],
      });
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      mockGenerate.mockResolvedValue('Edge case result');
    });

    it('should handle special characters in issue title and body', async () => {
      mockContextGet
        .mockReturnValueOnce('Title with "quotes" & <tags>')
        .mockReturnValueOnce('Body with $pecial ch@rs!')
        .mockReturnValueOnce('999');

      await planGenerationStep.execute(mockContext);

      const callArgs = cast<StreamRequest>(
        (mockGenerate as MockedFunction<typeof mockGenerate>).mock.calls[0][0]
      );
      expect(callArgs.prompt).toContain('Title with "quotes" & <tags>');
      expect(callArgs.prompt).toContain('Body with $pecial ch@rs!');
    });

    it('should handle template variables with special regex characters', async () => {
      mockContextGet
        .mockReturnValueOnce('Title with $1 and (parentheses)')
        .mockReturnValueOnce('Body with [brackets] and {braces}')
        .mockReturnValueOnce('111');

      const configWithTemplate: PlanGenerationStepConfig = {
        ...mockConfig,
        prompt_template:
          'Process: {{github.issue.title}} - Details: {{github.issue.body}}',
      };

      const stepWithTemplate = new PlanGenerationStep(
        mockLogger,
        mockLLMProvider,
        configWithTemplate
      );

      await stepWithTemplate.execute(mockContext);

      const callArgs = cast<StreamRequest>(
        (mockGenerate as MockedFunction<typeof mockGenerate>).mock.calls[0][0]
      );
      expect(callArgs.prompt).toBe(
        'Process: Title with $1 and (parentheses) - Details: Body with [brackets] and {braces}'
      );
    });
  });
});
