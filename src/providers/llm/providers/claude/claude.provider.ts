import Anthropic from '@anthropic-ai/sdk';

import type { IProviderHelper } from '../../helpers/provider-helper.js';
import type {
  ILLMProvider,
  StreamRequest,
  StreamEvent,
} from '../../interfaces/provider.js';

export class ClaudeProvider implements ILLMProvider {
  private client: Anthropic;
  private static readonly ALLOWED_ROLES = [
    'system',
    'user',
    'assistant',
  ] as const;

  constructor(
    apiKey: string,
    private helper: IProviderHelper
  ) {
    this.client = new Anthropic({ apiKey });
  }

  private guardValidateRoles(messages: StreamRequest['messages']): void {
    for (const message of messages) {
      if (
        !ClaudeProvider.ALLOWED_ROLES.includes(
          message.role as (typeof ClaudeProvider.ALLOWED_ROLES)[number]
        )
      ) {
        throw new Error(
          `Role '${message.role}' is not supported by Claude API. ` +
            `Allowed roles: ${ClaudeProvider.ALLOWED_ROLES.join(', ')}`
        );
      }
    }
  }

  private prepareMessages(
    request: StreamRequest
  ): Array<{ role: 'user' | 'assistant'; content: string }> {
    this.guardValidateRoles(request.messages);

    const filteredMessages: Array<{
      role: 'user' | 'assistant';
      content: string;
    }> = [];

    for (const m of request.messages) {
      if (m.role === 'system') {
        // System messages are handled separately
        continue;
      } else if (['user', 'assistant'].includes(m.role)) {
        filteredMessages.push({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        });
      }
    }

    return filteredMessages;
  }

  private extractSystemPrompt(request: StreamRequest): string | undefined {
    return (
      request.systemPrompt ||
      request.messages.find(m => m.role === 'system')?.content
    );
  }

  private async createStream(
    request: StreamRequest,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<AsyncIterable<Anthropic.Messages.MessageStreamEvent>> {
    const systemPrompt = this.extractSystemPrompt(request);
    return await this.client.messages.create({
      messages,
      model: request.model,
      max_tokens: request.maxTokens || 1000,
      temperature: request.temperature,
      system: systemPrompt,
      stream: true,
    });
  }

  private processContentDelta(
    chunk: Anthropic.Messages.MessageStreamEvent,
    usage: { promptTokens: number; completionTokens: number }
  ): StreamEvent | null {
    if (
      chunk.type === 'content_block_delta' &&
      'delta' in chunk &&
      'text' in chunk.delta
    ) {
      usage.completionTokens++; // Rough estimate
      return { type: 'token', token: chunk.delta.text };
    }
    return null;
  }

  private processMessageStart(
    chunk: Anthropic.Messages.MessageStreamEvent,
    usage: { promptTokens: number; completionTokens: number }
  ): void {
    if (
      chunk.type === 'message_start' &&
      'message' in chunk &&
      chunk.message.usage
    ) {
      usage.promptTokens = chunk.message.usage.input_tokens || 0;
    }
  }

  private processMessageDelta(
    chunk: Anthropic.Messages.MessageStreamEvent,
    usage: { promptTokens: number; completionTokens: number }
  ): void {
    if (chunk.type === 'message_delta' && 'usage' in chunk && chunk.usage) {
      usage.completionTokens =
        chunk.usage.output_tokens || usage.completionTokens;
    }
  }

  private *processChunk(
    chunk: Anthropic.Messages.MessageStreamEvent,
    usage: { promptTokens: number; completionTokens: number }
  ): Generator<StreamEvent> {
    const contentDelta = this.processContentDelta(chunk, usage);
    if (contentDelta) {
      yield contentDelta;
    }
    this.processMessageStart(chunk, usage);
    this.processMessageDelta(chunk, usage);
  }

  async *stream(request: StreamRequest): AsyncIterableIterator<StreamEvent> {
    try {
      const messages = this.prepareMessages(request);
      const stream = await this.createStream(request, messages);
      const usage = { promptTokens: 0, completionTokens: 0 };

      for await (const chunk of stream) {
        this.helper.checkAbortSignal(request.signal);
        yield* this.processChunk(chunk, usage);
      }

      // Yield final usage
      yield {
        type: 'done',
        usage: {
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.promptTokens + usage.completionTokens,
        },
      };
    } catch (error) {
      yield this.helper.wrapError(error as Error, request.signal);
    }
  }

  async generate(request: StreamRequest): Promise<string> {
    // Use helper to convert stream to string
    return this.helper.streamToString(this.stream(request));
  }

  getProviderName(): string {
    return 'claude';
  }

  getAvailableModels(): string[] {
    return [
      'claude-opus-4',
      'claude-sonnet-4',
      'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-5-sonnet-20240620',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ];
  }
}
