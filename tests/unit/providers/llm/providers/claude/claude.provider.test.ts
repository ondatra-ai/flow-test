import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { IProviderHelper } from '../../../../../../src/providers/llm/helpers/provider-helper.js';
import type { IStreamRequest } from '../../../../../../src/providers/llm/interfaces/provider.js';
import { ClaudeProvider } from '../../../../../../src/providers/llm/providers/claude/claude.provider.js';

// Mock Anthropic SDK
const mockAnthropicClient = {
  messages: {
    create: vi.fn(),
  },
};

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn(() => mockAnthropicClient),
  };
});

describe('ClaudeProvider', () => {
  let provider: ClaudeProvider;
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
    provider = new ClaudeProvider('test-api-key', mockHelper);
  });

  describe('constructor', () => {
    it('should initialize with API key and helper', () => {
      expect(provider).toBeInstanceOf(ClaudeProvider);
      expect(provider.getProviderName()).toBe('claude');
    });
  });

  describe('getProviderName', () => {
    it('should return "claude"', () => {
      expect(provider.getProviderName()).toBe('claude');
    });
  });

  describe('getAvailableModels', () => {
    it('should return list of Claude models', () => {
      const models = provider.getAvailableModels();
      expect(models).toContain('claude-opus-4');
      expect(models).toContain('claude-sonnet-4');
      expect(models).toContain('claude-3-5-sonnet-20241022');
      expect(models.length).toBeGreaterThan(0);
    });
  });

  describe('streaming functionality', () => {
    it('should process content delta chunks', async () => {
      const request: IStreamRequest = {
        model: 'claude-3-5-sonnet-20241022',
        prompt: 'Test prompt',
        messages: [{ role: 'user', content: 'Hello' }],
        signal: new AbortController().signal,
      };

      const mockStream = {
        async *[Symbol.asyncIterator](): AsyncGenerator<{
          type: string;
          message?: { usage?: { input_tokens?: number } };
          delta?: { text?: string };
          usage?: { output_tokens?: number };
        }> {
          yield {
            type: 'message_start',
            message: { usage: { input_tokens: 10 } },
          };
          yield { type: 'content_block_delta', delta: { text: 'Hello' } };
          yield { type: 'content_block_delta', delta: { text: ' world' } };
          yield { type: 'message_delta', usage: { output_tokens: 5 } };
        },
      };

      mockAnthropicClient.messages.create.mockResolvedValue(mockStream);

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

    it('should handle token counting', async () => {
      const request: IStreamRequest = {
        model: 'claude-3-5-sonnet-20241022',
        prompt: 'Test prompt',
        messages: [{ role: 'user', content: 'Hello' }],
        signal: new AbortController().signal,
      };

      const mockStream = {
        async *[Symbol.asyncIterator](): AsyncGenerator<{
          type: string;
          message?: { usage?: { input_tokens?: number } };
          delta?: { text?: string };
          usage?: { output_tokens?: number };
        }> {
          yield {
            type: 'message_start',
            message: { usage: { input_tokens: 15 } },
          };
          yield { type: 'content_block_delta', delta: { text: 'Response' } };
          yield { type: 'message_delta', usage: { output_tokens: 8 } };
        },
      };

      mockAnthropicClient.messages.create.mockResolvedValue(mockStream);

      const stream = provider.stream(request);
      const events = [];
      for await (const event of stream) {
        events.push(event);
      }

      const doneEvent = events.find(e => e.type === 'done');
      expect(doneEvent).toBeDefined();
      expect(doneEvent?.usage).toEqual({
        promptTokens: 15,
        completionTokens: 8,
        totalTokens: 23,
      });
    });

    it('should check abort signal during streaming', async () => {
      const request: IStreamRequest = {
        model: 'claude-3-5-sonnet-20241022',
        prompt: 'Test prompt',
        messages: [{ role: 'user', content: 'Hello' }],
        signal: new AbortController().signal,
      };

      const mockStream = {
        async *[Symbol.asyncIterator](): AsyncGenerator<{
          type: string;
          delta?: { text?: string };
        }> {
          yield { type: 'content_block_delta', delta: { text: 'Hello' } };
        },
      };

      mockAnthropicClient.messages.create.mockResolvedValue(mockStream);

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
        model: 'claude-3-5-sonnet-20241022',
        prompt: 'Test prompt',
        messages: [{ role: 'user', content: 'Hello' }],
        signal: new AbortController().signal,
      };

      const error = new Error('API Error');
      mockAnthropicClient.messages.create.mockRejectedValue(error);

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
        model: 'claude-3-5-sonnet-20241022',
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
        model: 'claude-3-5-sonnet-20241022',
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
      }).rejects.toThrow("Role 'invalid' is not supported by Claude API");

      // Helper should not be called for error wrapping
      expect(mockHelper.wrapError).not.toHaveBeenCalled();
    });
  });

  describe('API configuration', () => {
    it('should pass correct parameters to Anthropic API', async () => {
      const request: IStreamRequest = {
        model: 'claude-3-5-sonnet-20241022',
        prompt: 'Test prompt',
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 500,
        temperature: 0.7,
        signal: new AbortController().signal,
      };

      const mockStream = {
        async *[Symbol.asyncIterator](): AsyncGenerator<{
          type: string;
          delta?: { text?: string };
        }> {
          yield { type: 'content_block_delta', delta: { text: 'Response' } };
        },
      };

      mockAnthropicClient.messages.create.mockResolvedValue(mockStream);

      const stream = provider.stream(request);
      const events = [];
      for await (const event of stream) {
        events.push(event);
      }

      const createCall = mockAnthropicClient.messages.create;
      expect(createCall).toHaveBeenCalledWith({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        temperature: 0.7,
        system: undefined,
        stream: true,
      });
    });
  });
});
