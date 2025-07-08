export interface ILLMProvider {
  /**
   * Stream tokens as they are generated
   */
  stream(request: StreamRequest): AsyncIterableIterator<StreamEvent>;

  /**
   * Generate complete response (non-streaming)
   */
  generate(request: StreamRequest): Promise<string>;

  /**
   * Get provider metadata
   */
  getProviderName(): string;
  getAvailableModels(): string[];
}

// Only the essential types needed by ILLMProvider

export interface StreamRequest {
  prompt: string;
  signal: AbortSignal;
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  // Conversation support directly in StreamRequest
  messages?: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
}

export interface StreamEvent {
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
