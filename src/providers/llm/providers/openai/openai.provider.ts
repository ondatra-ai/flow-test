// src/providers/llm/providers/openai/openai.provider.ts

import OpenAI from 'openai';

import type { IProviderHelper } from '../../helpers/provider-helper.js';
import type {
  ILLMProvider,
  StreamRequest,
  StreamEvent,
} from '../../interfaces/provider.js';

export class OpenAIProvider implements ILLMProvider {
  private client: OpenAI;

  constructor(
    apiKey: string,
    private helper: IProviderHelper
  ) {
    this.client = new OpenAI({ apiKey });
  }

  async *stream(request: StreamRequest): AsyncIterableIterator<StreamEvent> {
    try {
      const messages = request.messages || [
        { role: 'user' as const, content: request.prompt },
      ];

      // Add system message if provided
      if (request.systemPrompt) {
        messages.unshift({
          role: 'system' as const,
          content: request.systemPrompt,
        });
      }

      const stream = await this.client.chat.completions.create({
        messages,
        model: request.model,
        max_tokens: request.maxTokens,
        temperature: request.temperature,
        stream: true,
      });

      let totalTokens = 0;

      for await (const chunk of stream) {
        this.helper.checkAbortSignal(request.signal);

        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield { type: 'token', token: content };
          totalTokens++;
        }

        // Check if stream is finished
        if (chunk.choices[0]?.finish_reason === 'stop') {
          // OpenAI doesn't provide token usage in streaming mode
          // This is a rough estimate
          const promptTokens = Math.ceil(request.prompt.length / 4);
          const completionTokens = totalTokens;

          yield {
            type: 'done',
            usage: {
              promptTokens,
              completionTokens,
              totalTokens: promptTokens + completionTokens,
            },
          };
        }
      }
    } catch (error) {
      yield this.helper.wrapError(error as Error, request.signal);
    }
  }

  async generate(request: StreamRequest): Promise<string> {
    return this.helper.streamToString(this.stream(request));
  }

  getProviderName(): string {
    return 'openai';
  }

  getAvailableModels(): string[] {
    return [
      'gpt-4-turbo-preview',
      'gpt-4',
      'gpt-4-32k',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
    ];
  }
}
