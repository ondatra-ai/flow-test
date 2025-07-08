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
  private static readonly ALLOWED_ROLES = [
    'system',
    'user',
    'assistant',
  ] as const;

  constructor(
    apiKey: string,
    private helper: IProviderHelper
  ) {
    this.client = new OpenAI({ apiKey });
  }

  private guardValidateRoles(messages: StreamRequest['messages']): void {
    for (const message of messages) {
      if (
        !OpenAIProvider.ALLOWED_ROLES.includes(
          message.role as (typeof OpenAIProvider.ALLOWED_ROLES)[number]
        )
      ) {
        throw new Error(
          `Role '${message.role}' is not supported by OpenAI API. ` +
            `Allowed roles: ${OpenAIProvider.ALLOWED_ROLES.join(', ')}`
        );
      }
    }
  }

  private validateAndPrepareMessages(
    request: StreamRequest
  ): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    this.guardValidateRoles(request.messages);

    const supportedMessages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }> = [];

    for (const msg of request.messages) {
      if (['system', 'user', 'assistant'].includes(msg.role)) {
        supportedMessages.push({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content,
        });
      }
    }

    if (request.systemPrompt) {
      supportedMessages.unshift({
        role: 'system' as const,
        content: request.systemPrompt,
      });
    }

    return supportedMessages;
  }

  private async createStream(
    request: StreamRequest,
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  ): Promise<AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>> {
    return await this.client.chat.completions.create({
      messages,
      model: request.model,
      max_tokens: request.maxTokens,
      temperature: request.temperature,
      stream: true,
    });
  }

  async *stream(request: StreamRequest): AsyncIterableIterator<StreamEvent> {
    try {
      const messages = this.validateAndPrepareMessages(request);
      const stream = await this.createStream(request, messages);
      let totalTokens = 0;

      for await (const chunk of stream) {
        this.helper.checkAbortSignal(request.signal);

        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield { type: 'token', token: content };
          totalTokens++;
        }

        if (chunk.choices[0]?.finish_reason === 'stop') {
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
      'gpt-4.1',
      'gpt-4.1-mini',
      'gpt-4.1-nano',
      'gpt-4o',
      'gpt-4o-mini',
      'o3-mini-2025-01-31',
      'o1-preview',
      'o1-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
    ];
  }
}
