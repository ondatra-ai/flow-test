export interface ILLMProvider {
  /**
   * Stream tokens as they are generated
   */
  stream(request: IStreamRequest): AsyncIterableIterator<IStreamEvent>;

  /**
   * Generate complete response (non-streaming)
   */
  generate(request: IStreamRequest): Promise<string>;

  /**
   * Get provider metadata
   */
  getProviderName(): string;
  getAvailableModels(): string[];
}

// Only the essential types needed by ILLMProvider

export interface IStreamRequest {
  prompt: string;
  signal: AbortSignal;
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  // Conversation support directly in StreamRequest
  messages: Array<{
    role: 'system' | 'user' | 'assistant' | 'tool' | 'function';
    content: string;
  }>;
}

export interface IStreamEvent {
  type: 'token' | 'error' | 'done';
  // Union type - only the fields that exist for each type
  token?: string; // Only when type === 'token'
  error?: Error; // Only when type === 'error'
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  }; // Only when type === 'done'
}
