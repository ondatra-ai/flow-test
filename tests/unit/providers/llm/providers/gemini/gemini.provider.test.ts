// tests/unit/providers/llm/providers/gemini/gemini.provider.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GeminiProvider } from '../../../../../../src/providers/llm/providers/gemini/gemini.provider.js';
import type { IProviderHelper } from '../../../../../../src/providers/llm/helpers/provider-helper.js';
import type { StreamRequest } from '../../../../../../src/providers/llm/interfaces/provider.js';

// Mock Google Generative AI SDK
const mockChat = {
  sendMessageStream: vi.fn(),
};

const mockModel = {
  startChat: vi.fn(() => mockChat),
};

const mockGeminiClient = {
  getGenerativeModel: vi.fn(() => mockModel),
};

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn(() => mockGeminiClient),
  };
});

describe('GeminiProvider', () => {
  let provider: GeminiProvider;
  let mockHelper: IProviderHelper;

  beforeEach(() => {
    mockHelper = {
      checkAbortSignal: vi.fn(),
      wrapError: vi.fn().mockReturnValue({ type: 'error', error: new Error('Test error') }),
      streamToString: vi.fn().mockResolvedValue('Generated response'),
    };

    vi.clearAllMocks();
    provider = new GeminiProvider('test-api-key', mockHelper);
  });

  describe('constructor', () => {
    it('should initialize with API key and helper', () => {
      expect(provider).toBeInstanceOf(GeminiProvider);
      expect(provider.getProviderName()).toBe('gemini');
    });
  });

  describe('getProviderName', () => {
    it('should return "gemini"', () => {
      expect(provider.getProviderName()).toBe('gemini');
    });
  });

  describe('getAvailableModels', () => {
    it('should return list of Gemini models', () => {
      const models = provider.getAvailableModels();
      expect(models).toContain('gemini-2.5-pro');
      expect(models).toContain('gemini-2.5-flash');
      expect(models).toContain('gemini-2.5-flash-lite');
      expect(models.length).toBe(3);
    });
  });

  describe('streaming functionality', () => {
    it('should process text chunks', async () => {
      const request: StreamRequest = {
        model: 'gemini-2.5-pro',
        prompt: 'Test prompt',
        messages: [{ role: 'user', content: 'Hello' }],
        signal: new AbortController().signal,
      };

      const mockResult = {
        stream: {
          async *[Symbol.asyncIterator]() {
            yield { text: () => 'Hello' };
            yield { text: () => ' world' };
            yield { text: () => '!' };
          },
        },
      };

      mockChat.sendMessageStream.mockResolvedValue(mockResult);

      const stream = provider.stream(request);
      const events = [];
      for await (const event of stream) {
        events.push(event);
      }

      const tokenEvents = events.filter(e => e.type === 'token');
      expect(tokenEvents).toHaveLength(3);
      expect(tokenEvents[0].token).toBe('Hello');
      expect(tokenEvents[1].token).toBe(' world');
      expect(tokenEvents[2].token).toBe('!');
    });

    it('should handle token estimation', async () => {
      const request: StreamRequest = {
        model: 'gemini-2.5-pro',
        prompt: 'Test prompt with 20 chars',
        messages: [{ role: 'user', content: 'Hello' }],
        signal: new AbortController().signal,
      };

      const mockResult = {
        stream: {
          async *[Symbol.asyncIterator]() {
            yield { text: () => 'Response text' }; // 13 chars
          },
        },
      };

      mockChat.sendMessageStream.mockResolvedValue(mockResult);

      const stream = provider.stream(request);
      const events = [];
      for await (const event of stream) {
        events.push(event);
      }

      const doneEvent = events.find(e => e.type === 'done');
      expect(doneEvent).toBeDefined();
      expect(doneEvent?.usage).toEqual({
        promptTokens: Math.ceil(20 / 4), // 4 characters per token
        completionTokens: Math.ceil(13 / 4),
        totalTokens: Math.ceil(20 / 4) + Math.ceil(13 / 4),
      });
    });

    it('should check abort signal during streaming', async () => {
      const request: StreamRequest = {
        model: 'gemini-2.5-pro',
        prompt: 'Test prompt',
        messages: [{ role: 'user', content: 'Hello' }],
        signal: new AbortController().signal,
      };

      const mockResult = {
        stream: {
          async *[Symbol.asyncIterator]() {
            yield { text: () => 'Hello' };
          },
        },
      };

      mockChat.sendMessageStream.mockResolvedValue(mockResult);

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
      const request: StreamRequest = {
        model: 'gemini-2.5-pro',
        prompt: 'Test prompt',
        messages: [{ role: 'user', content: 'Hello' }],
        signal: new AbortController().signal,
      };

      const error = new Error('API Error');
      mockChat.sendMessageStream.mockRejectedValue(error);

      const stream = provider.stream(request);
      const events = [];
      for await (const event of stream) {
        events.push(event);
      }

      expect(mockHelper.wrapError).toHaveBeenCalledWith(error, request.signal);
      expect(events).toContainEqual({ type: 'error', error: new Error('Test error') });
    });
  });

  describe('generate method', () => {
    it('should use helper to convert stream to string', async () => {
      const request: StreamRequest = {
        model: 'gemini-2.5-pro',
        prompt: 'Test prompt',
        messages: [{ role: 'user', content: 'Hello' }],
        signal: new AbortController().signal,
      };

      const result = await provider.generate(request);

      expect(mockHelper.streamToString).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toBe('Generated response');
    });
  });

  describe('role validation', () => {
    it('should throw error for invalid roles', async () => {
      const request: StreamRequest = {
        model: 'gemini-2.5-pro',
        prompt: 'Test prompt',
        messages: [{ role: 'invalid' as any, content: 'Invalid role message' }],
        signal: new AbortController().signal,
      };

      const stream = provider.stream(request);
      
      await expect(async () => {
        for await (const event of stream) {
          // Should throw before yielding events
        }
      }).rejects.toThrow('not supported by Gemini API');
    });
  });

  describe('API configuration', () => {
    it('should pass correct parameters to Gemini API', async () => {
      const request: StreamRequest = {
        model: 'gemini-2.5-pro',
        prompt: 'Test prompt',
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 500,
        temperature: 0.7,
        signal: new AbortController().signal,
      };

      const mockResult = {
        stream: {
          async *[Symbol.asyncIterator]() {
            yield { text: () => 'Response' };
          },
        },
      };

      mockChat.sendMessageStream.mockResolvedValue(mockResult);

      const stream = provider.stream(request);
      const events = [];
      for await (const event of stream) {
        events.push(event);
      }

      expect(mockGeminiClient.getGenerativeModel).toHaveBeenCalledWith({
        model: 'gemini-2.5-pro',
      });

      expect(mockModel.startChat).toHaveBeenCalledWith({
        history: [{ role: 'user', parts: [{ text: 'Hello' }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      });
    });
  });
}); 