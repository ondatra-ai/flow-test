// tests/unit/providers/llm/providers/openai/openai.provider.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { IProviderHelper } from '../../../../../../src/providers/llm/helpers/provider-helper.js';
import type { IStreamRequest } from '../../../../../../src/providers/llm/interfaces/provider.js';
import { OpenAIProvider } from '../../../../../../src/providers/llm/providers/openai/openai.provider.js';

// Mock OpenAI SDK
const mockOpenAIClient = {
  chat: {
    completions: {
      create: vi.fn(),
    },
  },
};

vi.mock('openai', () => {
  return {
    default: vi.fn(() => mockOpenAIClient),
  };
});

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;
  let mockHelper: IProviderHelper;

  beforeEach(() => {
    mockHelper = {
      checkAbortSignal: vi.fn(),
      wrapError: vi
        .fn()
        .mockReturnValue({ type: 'error', error: new Error('Test error') }),
      streamToString: vi.fn().mockResolvedValue('Generated response'),
    };

    vi.clearAllMocks();
    provider = new OpenAIProvider('test-api-key', mockHelper);
  });

  describe('constructor', () => {
    it('should initialize with API key and helper', () => {
      expect(provider).toBeInstanceOf(OpenAIProvider);
      expect(provider.getProviderName()).toBe('openai');
    });
  });

  describe('getProviderName', () => {
    it('should return "openai"', () => {
      expect(provider.getProviderName()).toBe('openai');
    });
  });

  describe('getAvailableModels', () => {
    it('should return list of OpenAI models', () => {
      const models = provider.getAvailableModels();
      expect(models).toContain('gpt-4o');
      expect(models).toContain('gpt-4o-mini');
      expect(models).toContain('gpt-4-turbo');
      expect(models.length).toBeGreaterThan(0);
    });
  });

  describe('streaming functionality', () => {
    it('should process content delta chunks', async () => {
      const request: IStreamRequest = {
        model: 'gpt-4o',
        prompt: 'Test prompt',
        messages: [{ role: 'user', content: 'Hello' }],
        signal: new AbortController().signal,
      };

      const mockStream = {
        async *[Symbol.asyncIterator](): AsyncGenerator<{
          choices: Array<{ delta: { content?: string } }>;
        }> {
          yield { choices: [{ delta: { content: 'Hello' } }] };
          yield { choices: [{ delta: { content: ' world' } }] };
        },
      };

      mockOpenAIClient.chat.completions.create.mockResolvedValue(mockStream);

      const stream = provider.stream(request);
      const events = [];
      for await (const event of stream) {
        events.push(event);
      }

      const tokenEvents = events.filter(e => e.type === 'token');
      expect(tokenEvents).toHaveLength(2);
      expect(tokenEvents[0].token).toBe('Hello');
      expect(tokenEvents[1].token).toBe(' world');
    });

    it('should handle token counting with character estimation', async () => {
      const request: IStreamRequest = {
        model: 'gpt-4o',
        prompt: 'Test prompt', // 11 chars
        messages: [{ role: 'user', content: 'Hello' }],
        signal: new AbortController().signal,
      };

      const mockStream = {
        async *[Symbol.asyncIterator](): AsyncGenerator<{
          choices: Array<{
            delta: { content?: string };
            finish_reason?: string;
          }>;
        }> {
          yield { choices: [{ delta: { content: 'Response' } }] }; // 8 chars
          yield { choices: [{ delta: {}, finish_reason: 'stop' }] };
        },
      };

      mockOpenAIClient.chat.completions.create.mockResolvedValue(mockStream);

      const stream = provider.stream(request);
      const events = [];
      for await (const event of stream) {
        events.push(event);
      }

      const doneEvent = events.find(e => e.type === 'done');
      expect(doneEvent).toBeDefined();
      expect(doneEvent?.usage).toEqual({
        promptTokens: Math.ceil(11 / 4), // 3 tokens
        completionTokens: Math.ceil(8 / 4), // 2 tokens
        totalTokens: Math.ceil(11 / 4) + Math.ceil(8 / 4), // 5 tokens
      });
    });

    it('should check abort signal during streaming', async () => {
      const request: IStreamRequest = {
        model: 'gpt-4o',
        prompt: 'Test prompt',
        messages: [{ role: 'user', content: 'Hello' }],
        signal: new AbortController().signal,
      };

      const mockStream = {
        async *[Symbol.asyncIterator](): AsyncGenerator<{
          choices: Array<{ delta: { content?: string } }>;
        }> {
          yield { choices: [{ delta: { content: 'Hello' } }] };
        },
      };

      mockOpenAIClient.chat.completions.create.mockResolvedValue(mockStream);

      const stream = provider.stream(request);
      const events = [];
      for await (const event of stream) {
        events.push(event);
      }

      expect(mockHelper.checkAbortSignal).toHaveBeenCalledWith(request.signal);
    });
  });

  describe('error handling', () => {
    it('should handle streaming errors', async () => {
      const request: IStreamRequest = {
        model: 'gpt-4o',
        prompt: 'Test prompt',
        messages: [{ role: 'user', content: 'Hello' }],
        signal: new AbortController().signal,
      };

      const error = new Error('API Error');
      mockOpenAIClient.chat.completions.create.mockRejectedValue(error);

      const stream = provider.stream(request);

      // Error should bubble up directly instead of being wrapped
      await expect(async () => {
        for await (const _event of stream) {
          // This should throw before yielding any events
        }
      }).rejects.toThrow('API Error');

      // Helper should not be called for error wrapping
      expect(mockHelper.wrapError).not.toHaveBeenCalled();
    });
  });

  describe('generate method', () => {
    it('should use helper to convert stream to string', async () => {
      const request: IStreamRequest = {
        model: 'gpt-4o',
        prompt: 'Test prompt',
        messages: [{ role: 'user', content: 'Hello' }],
        signal: new AbortController().signal,
      };

      const result = await provider.generate(request);

      expect(mockHelper.streamToString).toHaveBeenCalledWith(
        expect.any(Object)
      );
      expect(result).toBe('Generated response');
    });
  });

  describe('role validation', () => {
    it('should throw error for invalid roles', async () => {
      const request: IStreamRequest = {
        model: 'gpt-4o',
        prompt: 'Test prompt',
        messages: [
          { role: 'invalid' as never, content: 'Invalid role message' },
        ],
        signal: new AbortController().signal,
      };

      const stream = provider.stream(request);

      // Should throw directly for invalid roles instead of yielding error event
      await expect(async () => {
        for await (const _event of stream) {
          // This should throw before yielding any events
        }
      }).rejects.toThrow("Role 'invalid' is not supported by OpenAI API");

      // Helper should not be called for error wrapping
      expect(mockHelper.wrapError).not.toHaveBeenCalled();
    });
  });

  describe('API configuration', () => {
    it('should pass correct parameters to OpenAI API', async () => {
      const request: IStreamRequest = {
        model: 'gpt-4o',
        prompt: 'Test prompt',
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 500,
        temperature: 0.7,
        signal: new AbortController().signal,
      };

      const mockStream = {
        async *[Symbol.asyncIterator](): AsyncGenerator<{
          choices: Array<{ delta: { content?: string } }>;
        }> {
          yield { choices: [{ delta: { content: 'Response' } }] };
        },
      };

      mockOpenAIClient.chat.completions.create.mockResolvedValue(mockStream);

      const stream = provider.stream(request);
      const events = [];
      for await (const event of stream) {
        events.push(event);
      }

      const createCall = mockOpenAIClient.chat.completions.create;
      expect(createCall).toHaveBeenCalledWith({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-4o',
        max_tokens: 500,
        temperature: 0.7,
        stream: true,
      });
    });
  });
});
