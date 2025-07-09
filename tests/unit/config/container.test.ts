// tests/unit/config/container.test.ts

import 'reflect-metadata';
import { container } from 'tsyringe';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  initializeContainer,
  SERVICES,
} from '../../../src/config/container.js';
import type { IProviderHelper } from '../../../src/providers/llm/helpers/provider-helper.js';
import type { ILLMProvider } from '../../../src/providers/llm/interfaces/provider.js';
import type { Logger } from '../../../src/utils/logger.js';

// Mock the SDK dependencies
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(() => ({ messages: { create: vi.fn() } })),
}));

vi.mock('openai', () => ({
  default: vi.fn(() => ({ chat: { completions: { create: vi.fn() } } })),
}));

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(() => ({ getGenerativeModel: vi.fn() })),
}));

// Mock environment variables
const mockEnv = {
  CLAUDE_API_KEY: 'test-claude-key',
  OPENAI_API_KEY: 'test-openai-key',
  GEMINI_API_KEY: 'test-gemini-key',
};

describe('Container Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv, ...mockEnv };
    container.clearInstances();
  });

  afterEach(() => {
    process.env = originalEnv;
    container.clearInstances();
  });

  describe('SERVICES tokens', () => {
    it('should define all required service tokens', () => {
      expect(SERVICES.Logger).toBeDefined();
      expect(SERVICES.ProviderHelper).toBeDefined();
      expect(SERVICES.ClaudeProvider).toBeDefined();
      expect(SERVICES.OpenAIProvider).toBeDefined();
      expect(SERVICES.GeminiProvider).toBeDefined();
    });

    it('should use symbols for type safety', () => {
      expect(typeof SERVICES.Logger).toBe('symbol');
      expect(typeof SERVICES.ProviderHelper).toBe('symbol');
      expect(typeof SERVICES.ClaudeProvider).toBe('symbol');
      expect(typeof SERVICES.OpenAIProvider).toBe('symbol');
      expect(typeof SERVICES.GeminiProvider).toBe('symbol');
    });

    it('should have unique symbols', () => {
      const tokens = Object.values(SERVICES);
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(tokens.length);
    });
  });

  describe('initializeContainer', () => {
    it('should register Logger service', () => {
      initializeContainer();

      expect(container.isRegistered(SERVICES.Logger)).toBe(true);

      const logger = container.resolve<Logger>(SERVICES.Logger);
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    it('should register ProviderHelper as singleton', () => {
      initializeContainer();

      expect(container.isRegistered(SERVICES.ProviderHelper)).toBe(true);

      const helper1 = container.resolve<IProviderHelper>(
        SERVICES.ProviderHelper
      );
      const helper2 = container.resolve<IProviderHelper>(
        SERVICES.ProviderHelper
      );

      expect(helper1).toBe(helper2);
    });

    it('should register Claude provider with factory', () => {
      initializeContainer();

      expect(container.isRegistered(SERVICES.ClaudeProvider)).toBe(true);

      const provider = container.resolve<ILLMProvider>(SERVICES.ClaudeProvider);
      expect(provider).toBeDefined();
      expect(provider.getProviderName()).toBe('claude');
    });

    it('should register OpenAI provider with factory', () => {
      initializeContainer();

      expect(container.isRegistered(SERVICES.OpenAIProvider)).toBe(true);

      const provider = container.resolve<ILLMProvider>(SERVICES.OpenAIProvider);
      expect(provider).toBeDefined();
      expect(provider.getProviderName()).toBe('openai');
    });

    it('should register Gemini provider with factory', () => {
      initializeContainer();

      expect(container.isRegistered(SERVICES.GeminiProvider)).toBe(true);

      const provider = container.resolve<ILLMProvider>(SERVICES.GeminiProvider);
      expect(provider).toBeDefined();
      expect(provider.getProviderName()).toBe('gemini');
    });

    it('should not register services multiple times', () => {
      initializeContainer();
      initializeContainer();

      expect(container.isRegistered(SERVICES.Logger)).toBe(true);
      expect(container.isRegistered(SERVICES.ProviderHelper)).toBe(true);
      expect(container.isRegistered(SERVICES.ClaudeProvider)).toBe(true);
      expect(container.isRegistered(SERVICES.OpenAIProvider)).toBe(true);
      expect(container.isRegistered(SERVICES.GeminiProvider)).toBe(true);
    });
  });

  describe('Environment variable handling', () => {
    it('should throw error when CLAUDE_API_KEY is missing', () => {
      process.env.CLAUDE_API_KEY = undefined;
      initializeContainer();

      expect(() => {
        container.resolve<ILLMProvider>(SERVICES.ClaudeProvider);
      }).toThrow('CLAUDE_API_KEY environment variable is required');
    });

    it('should throw error when OPENAI_API_KEY is missing', () => {
      process.env.OPENAI_API_KEY = undefined;
      initializeContainer();

      expect(() => {
        container.resolve<ILLMProvider>(SERVICES.OpenAIProvider);
      }).toThrow('OPENAI_API_KEY environment variable is required');
    });

    it('should throw error when GEMINI_API_KEY is missing', () => {
      process.env.GEMINI_API_KEY = undefined;
      initializeContainer();

      expect(() => {
        container.resolve<ILLMProvider>(SERVICES.GeminiProvider);
      }).toThrow('GEMINI_API_KEY environment variable is required');
    });

    it('should use environment variables for API keys', () => {
      initializeContainer();

      const claudeProvider = container.resolve<ILLMProvider>(
        SERVICES.ClaudeProvider
      );
      const openaiProvider = container.resolve<ILLMProvider>(
        SERVICES.OpenAIProvider
      );
      const geminiProvider = container.resolve<ILLMProvider>(
        SERVICES.GeminiProvider
      );

      expect(claudeProvider).toBeDefined();
      expect(openaiProvider).toBeDefined();
      expect(geminiProvider).toBeDefined();
    });
  });

  describe('Provider factory functions', () => {
    it('should inject ProviderHelper into providers', () => {
      initializeContainer();

      const helper = container.resolve<IProviderHelper>(
        SERVICES.ProviderHelper
      );
      const provider = container.resolve<ILLMProvider>(SERVICES.ClaudeProvider);

      expect(helper).toBeDefined();
      expect(provider).toBeDefined();
    });

    it('should create different provider instances', () => {
      initializeContainer();

      const claudeProvider = container.resolve<ILLMProvider>(
        SERVICES.ClaudeProvider
      );
      const openaiProvider = container.resolve<ILLMProvider>(
        SERVICES.OpenAIProvider
      );
      const geminiProvider = container.resolve<ILLMProvider>(
        SERVICES.GeminiProvider
      );

      expect(claudeProvider).not.toBe(openaiProvider);
      expect(openaiProvider).not.toBe(geminiProvider);
      expect(claudeProvider).not.toBe(geminiProvider);

      expect(claudeProvider.getProviderName()).toBe('claude');
      expect(openaiProvider.getProviderName()).toBe('openai');
      expect(geminiProvider.getProviderName()).toBe('gemini');
    });
  });

  describe('Container export', () => {
    it('should export pre-configured container', () => {
      expect(container).toBeDefined();
      expect(typeof container.resolve).toBe('function');
      expect(typeof container.register).toBe('function');
      expect(typeof container.isRegistered).toBe('function');
    });
  });
});
