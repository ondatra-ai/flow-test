import { GoogleGenerativeAI } from '@google/generative-ai';

import type { IProviderHelper } from '../../helpers/provider-helper.js';
import type {
  ILLMProvider,
  StreamRequest,
  StreamEvent,
} from '../../interfaces/provider.js';

export class GeminiProvider implements ILLMProvider {
  private readonly client: GoogleGenerativeAI;
  private static readonly ALLOWED_ROLES = [
    'system',
    'user',
    'assistant',
  ] as const;

  constructor(
    apiKey: string,
    private readonly helper: IProviderHelper
  ) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  private guardValidateRoles(messages: StreamRequest['messages']): void {
    for (const message of messages) {
      if (
        !GeminiProvider.ALLOWED_ROLES.includes(
          message.role as (typeof GeminiProvider.ALLOWED_ROLES)[number]
        )
      ) {
        throw new Error(
          `Role '${message.role}' is not supported by Gemini API. ` +
            `Allowed roles: ${GeminiProvider.ALLOWED_ROLES.join(', ')}`
        );
      }
    }
  }

  private buildPromptAndHistory(request: StreamRequest): {
    prompt: string;
    history: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }>;
  } {
    this.guardValidateRoles(request.messages);

    if (request.messages.length === 0) {
      return { prompt: request.prompt, history: [] };
    }

    const history: Array<{
      role: 'user' | 'model';
      parts: [{ text: string }];
    }> = [];
    let prompt = request.prompt;
    let hasSystemPrompt = false;

    for (const message of request.messages) {
      if (message.role === 'system') {
        // Accumulate all system prompts, not just the first one
        if (!hasSystemPrompt) {
          prompt = `${message.content}\n\n${prompt}`;
          hasSystemPrompt = true;
        } else {
          // Append additional system prompts with proper spacing
          prompt = `${message.content}\n${prompt}`;
        }
      } else if (['user', 'assistant'].includes(message.role)) {
        const role = message.role === 'assistant' ? 'model' : 'user';
        history.push({ role, parts: [{ text: message.content }] });
      }
    }

    return { prompt, history };
  }

  async *stream(request: StreamRequest): AsyncIterableIterator<StreamEvent> {
    const model = this.client.getGenerativeModel({ model: request.model });
    const { prompt, history } = this.buildPromptAndHistory(request);

    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: request.temperature,
        maxOutputTokens: request.maxTokens,
      },
    });

    const result = await chat.sendMessageStream(prompt);

    // Token counting for Gemini in streaming mode requires estimation
    // Gemini doesn't provide exact token counts in streaming responses
    // We estimate using character-based calculation similar to OpenAI
    // Each chunk from Gemini may contain multiple words/tokens
    let completionCharacterCount = 0;

    for await (const chunk of result.stream) {
      this.helper.checkAbortSignal(request.signal);

      const text = chunk.text();
      if (text) {
        // Count characters for token estimation
        completionCharacterCount += text.length;
        yield { type: 'token', token: text };
      }
    }

    // Estimate token counts using character-based calculation
    // Standard ratio: approximately 1 token = 4 characters (0.25 per char)
    const promptTokens = Math.ceil(prompt.length / 4);
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

  async generate(request: StreamRequest): Promise<string> {
    return this.helper.streamToString(this.stream(request));
  }

  getProviderName(): string {
    return 'gemini';
  }

  getAvailableModels(): string[] {
    return ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];
  }
}
