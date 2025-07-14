// src/providers/llm/providers/openai/openai.provider.ts

import OpenAI from 'openai';

import { OpenAIRole } from '../../../../types/providers/openai.types';
import type { IProviderHelper } from '../../helpers/provider-helper.js';
import type {
  ILLMProvider,
  StreamRequest,
  StreamEvent,
} from '../../interfaces/provider.js';

export class OpenAIProvider implements ILLMProvider {
  private readonly client: OpenAI;
  private static readonly ALLOWED_ROLES = [
    'system',
    'user',
    'assistant',
  ] as const;

  constructor(
    apiKey: string,
    private readonly helper: IProviderHelper
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
  ): Array<{ role: OpenAIRole; content: string }> {
    this.guardValidateRoles(request.messages);

    const supportedMessages: Array<{
      role: OpenAIRole;
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
    messages: Array<{ role: OpenAIRole; content: string }>
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
    const messages = this.validateAndPrepareMessages(request);
    const stream = await this.createStream(request, messages);

    // Token counting in streaming mode requires estimation
    // OpenAI doesn't provide exact token counts in streaming responses
    // We estimate based on character count using the standard 4:1 ratio
    // This means approximately 1 token = 4 characters (0.25 tokens per
    // character)
    //
    // This ratio comes from empirical analysis of OpenAI tokenization:
    // - English text averages ~4 characters per token
    // - Code and non-English text may vary significantly
    // - For precise counts, consider using tiktoken library in non-streaming
    //   mode
    let completionCharacterCount = 0;

    for await (const chunk of stream) {
      this.helper.checkAbortSignal(request.signal);

      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield { type: 'token', token: content };
        // Count characters instead of chunks for better token estimation
        completionCharacterCount += content.length;
      }

      if (chunk.choices[0]?.finish_reason === 'stop') {
        // Estimate token counts using character-based calculation
        // Both prompt and completion use the same 4:1 character-to-token
        // ratio
        const promptTokens = Math.ceil(request.prompt.length / 4);
        const completionTokens = Math.ceil(completionCharacterCount / 4);

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
