/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import type { IContext } from '../../../../src/flow/context.js';
import { PlanGenerationStep } from '../../../../src/flow/types/plan-generation-step.js';
import type { ILLMProvider } from '../../../../src/interfaces/providers/index.js';
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

describe('PlanGenerationStep - Core Functionality', () => {
  let planGenerationStep: PlanGenerationStep;
  let mockConfig: PlanGenerationStepConfig;

  // Helper function to create fresh test mocks for isolated testing
  function createFreshTestMocks(contextMockBehavior?: (mockGet: Mock) => void) {
    const freshContextGet = vi.fn();

    if (contextMockBehavior) {
      contextMockBehavior(freshContextGet);
    } else {
      // Default behavior - return undefined for all calls
      freshContextGet.mockReturnValue(undefined);
    }

    const freshContextSet = vi.fn();
    const freshContext = cast<IContext>({
      get: freshContextGet,
      set: freshContextSet,
    });

    const freshGenerate = vi.fn().mockResolvedValue('Generated plan');
    const freshGetProviderName = vi.fn();
    const freshLLMProvider = cast<ILLMProvider>({
      generate: freshGenerate,
      getProviderName: freshGetProviderName,
    });

    const freshLoggerInfo = vi.fn();
    const freshLoggerError = vi.fn();
    const freshLoggerWarn = vi.fn();
    const freshLoggerDebug = vi.fn();
    const freshLogger = cast<Logger>({
      info: freshLoggerInfo,
      error: freshLoggerError,
      warn: freshLoggerWarn,
      debug: freshLoggerDebug,
    });

    return {
      freshContext,
      freshLLMProvider,
      freshLogger,
      freshGenerate,
      freshContextGet,
      freshContextSet,
      freshLoggerInfo,
      freshLoggerError,
      freshLoggerWarn,
      freshLoggerDebug,
      freshGetProviderName,
    };
  }

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

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(planGenerationStep.getConfig()).toEqual(mockConfig);
    });

    it('should call parent constructor with correct parameters', () => {
      const config = planGenerationStep.getConfig();
      expect(config.id).toBe('test-plan-generation');
    });
  });

  describe('execute', () => {
    beforeEach(() => {
      mockGenerate.mockResolvedValue('Generated execution plan');
      mockContextGet
        .mockReturnValueOnce('[TEST Issue] Sample title') // github.issue.title
        .mockReturnValueOnce('Sample issue description') // github.issue.body
        .mockReturnValueOnce('123') // github.issue.number
        .mockReturnValue(undefined); // All other context.get calls
    });

    it('should execute successfully with context data', async () => {
      const result = await planGenerationStep.execute(mockContext);

      expect(mockLoggerInfo).toHaveBeenCalledWith(
        'Executing PlanGenerationStep: test-plan-generation'
      );
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        'Generating plan for issue #123: "[TEST Issue] Sample title"'
      );
      expect(mockLoggerInfo).toHaveBeenCalledWith('=== GENERATED PLAN ===');
      expect(mockLoggerInfo).toHaveBeenCalledWith('Generated execution plan');
      expect(mockLoggerInfo).toHaveBeenCalledWith('=== END PLAN ===');
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        'Plan generation completed successfully'
      );

      expect(mockGenerate).toHaveBeenCalledWith({
        prompt: expect.stringContaining('[TEST Issue] Sample title'),
        temperature: 0.8,
        maxTokens: 1500,
        model: 'claude-sonnet-4-20250514',
        signal: expect.any(AbortSignal),
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('[TEST Issue] Sample title'),
          }),
        ]),
      });

      expect(result).toEqual('next-step');
    });

    it('should handle missing context data with defaults', async () => {
      const {
        freshContext,
        freshLLMProvider,
        freshLogger,
        freshGenerate,
        freshLoggerInfo,
      } = createFreshTestMocks();

      const freshStep = new PlanGenerationStep(
        freshLogger,
        freshLLMProvider,
        mockConfig
      );

      const result = await freshStep.execute(freshContext);

      expect(freshLoggerInfo).toHaveBeenCalledWith(
        'Generating plan for issue #: "Unknown Issue"'
      );

      expect(freshGenerate).toHaveBeenCalledWith({
        prompt: expect.stringContaining('Unknown Issue'),
        temperature: 0.8,
        maxTokens: 1500,
        model: 'claude-sonnet-4-20250514',
        signal: expect.any(AbortSignal),
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Unknown Issue'),
          }),
        ]),
      });

      expect(result).toEqual('next-step');
    });

    it('should use default config values when not specified', async () => {
      // Create config without optional fields
      const minimalConfig: PlanGenerationStepConfig = {
        id: 'minimal-plan-generation',
        type: 'plan-generation',
        llm_provider: 'claude',
        nextStepId: { default: 'next-step' },
      };

      const minimalStep = new PlanGenerationStep(
        mockLogger,
        mockLLMProvider,
        minimalConfig
      );

      await minimalStep.execute(mockContext);

      expect(mockGenerate).toHaveBeenCalledWith({
        prompt: expect.any(String),
        temperature: 0.7, // Default temperature
        maxTokens: 2000, // Default max_tokens
        model: 'gpt-3.5-turbo', // Default model
        signal: expect.any(AbortSignal),
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.any(String),
          }),
        ]),
      });
    });

    it('should handle LLM provider errors', async () => {
      const mockError = new Error('LLM provider failed');
      mockGenerate.mockRejectedValue(mockError);

      await expect(planGenerationStep.execute(mockContext)).rejects.toThrow(
        'LLM provider failed'
      );

      expect(mockLoggerError).toHaveBeenCalledWith(
        'PlanGenerationStep failed',
        mockError,
        { stepId: 'test-plan-generation' }
      );
    });
  });

  describe('getConfig', () => {
    it('should return the configuration object', () => {
      const config = planGenerationStep.getConfig();
      expect(config).toEqual(mockConfig);
      expect(config).toBe(mockConfig); // Should return the same reference
    });
  });
});
