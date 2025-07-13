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
      // Create fresh mocks for isolated testing
      const mockContextGet = vi
        .fn()
        .mockReturnValueOnce('Issue Title') // github.issue.title
        .mockReturnValueOnce('Issue Body') // github.issue.body
        .mockReturnValueOnce('456') // github.issue.number
        .mockReturnValue(undefined); // All other calls
      const mockContextSet = vi.fn();
      const mockContext = cast<IContext>({
        get: mockContextGet,
        set: mockContextSet,
      });

      const mockGenerate = vi.fn().mockResolvedValue('Generated plan');
      const mockGetProviderName = vi.fn();
      const mockLLMProvider = cast<ILLMProvider>({
        generate: mockGenerate,
        getProviderName: mockGetProviderName,
      });

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

      const step = new PlanGenerationStep(
        mockLogger,
        mockLLMProvider,
        mockConfig
      );

      await step.execute(mockContext);

      const callArgs = cast<StreamRequest>(
        (mockGenerate as MockedFunction<typeof mockGenerate>).mock.calls[0][0]
      );
      expect(callArgs.prompt).toContain('Generate a detailed execution plan');
      expect(callArgs.prompt).toContain('Title: Issue Title');
      expect(callArgs.prompt).toContain('Description: Issue Body');
      expect(callArgs.prompt).toContain('1. Overview');
      expect(callArgs.prompt).toContain('Format the response as markdown');
    });

    it('should substitute template variables in custom prompt', async () => {
      // Create fresh mocks for isolated testing
      const mockContextGet = vi
        .fn()
        .mockReturnValueOnce('Issue Title') // github.issue.title
        .mockReturnValueOnce('Issue Body') // github.issue.body
        .mockReturnValueOnce('456') // github.issue.number
        .mockReturnValue(undefined); // All other calls
      const mockContextSet = vi.fn();
      const mockContext = cast<IContext>({
        get: mockContextGet,
        set: mockContextSet,
      });

      const mockGenerate = vi.fn().mockResolvedValue('Generated plan');
      const mockGetProviderName = vi.fn();
      const mockLLMProvider = cast<ILLMProvider>({
        generate: mockGenerate,
        getProviderName: mockGetProviderName,
      });

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

      const configWithTemplate: PlanGenerationStepConfig = {
        ...mockConfig,
        prompt_template:
          'Create plan for {{github.issue.title}} - {{github.issue.body}}',
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
      expect(callArgs.prompt).toBe('Create plan for Issue Title - Issue Body');
    });

    it('should handle custom prompt template without variable substitution', async () => {
      // Create fresh mocks for isolated testing
      const mockContextGet = vi
        .fn()
        .mockReturnValueOnce('Issue Title') // github.issue.title
        .mockReturnValueOnce('Issue Body') // github.issue.body
        .mockReturnValueOnce('456') // github.issue.number
        .mockReturnValue(undefined); // All other calls
      const mockContextSet = vi.fn();
      const mockContext = cast<IContext>({
        get: mockContextGet,
        set: mockContextSet,
      });

      const mockGenerate = vi.fn().mockResolvedValue('Generated plan');
      const mockGetProviderName = vi.fn();
      const mockLLMProvider = cast<ILLMProvider>({
        generate: mockGenerate,
        getProviderName: mockGetProviderName,
      });

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

      const configWithTemplate: PlanGenerationStepConfig = {
        ...mockConfig,
        prompt_template: 'Simple prompt without variables',
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
      expect(callArgs.prompt).toBe('Simple prompt without variables');
    });

    it('should handle empty issue title and body in template substitution', async () => {
      // Create fresh mocks for this test
      const mockContextGet = vi
        .fn()
        .mockReturnValueOnce(null) // null title (will become 'Unknown Issue')
        .mockReturnValueOnce(null) // null body (will become '')
        .mockReturnValueOnce('789') // issue number
        .mockReturnValue(undefined); // All other context.get calls
      const mockContextSet = vi.fn();
      const mockContext = cast<IContext>({
        get: mockContextGet,
        set: mockContextSet,
      });

      const mockGenerate = vi.fn().mockResolvedValue('Generated plan');
      const mockGetProviderName = vi.fn();
      const mockLLMProvider = cast<ILLMProvider>({
        generate: mockGenerate,
        getProviderName: mockGetProviderName,
      });

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

      const configWithTemplate: PlanGenerationStepConfig = {
        ...mockConfig,
        prompt_template:
          'Title: {{github.issue.title}}, Body: {{github.issue.body}}',
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
      // null values get converted to 'Unknown Issue' and ''
      expect(callArgs.prompt).toBe('Title: Unknown Issue, Body: ');
    });
  });
});
