/**
 * Dependency injection service tokens using symbols for type safety
 *
 * Using symbols prevents typos and provides better type safety
 * compared to hard-coded string tokens.
 */
export const SERVICES = {
  Logger: Symbol('Logger'),
  FlowManager: Symbol('FlowManager'),
  // Step Factory tokens
  StepFactory: Symbol('StepFactory'),
  // GitHub integration tokens
  GitHubClient: Symbol('GitHubClient'),
  // LLM Provider tokens
  ProviderHelper: Symbol('ProviderHelper'),
  ClaudeProvider: Symbol('ClaudeProvider'),
  OpenAIProvider: Symbol('OpenAIProvider'),
  GeminiProvider: Symbol('GeminiProvider'),
} as const;
