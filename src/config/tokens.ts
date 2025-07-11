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
  ActionStep: Symbol('ActionStep'),
  DecisionStep: Symbol('DecisionStep'),
  LogStep: Symbol('LogStep'),
  // LLM Provider tokens
  ProviderHelper: Symbol('ProviderHelper'),
  ClaudeProvider: Symbol('ClaudeProvider'),
  OpenAIProvider: Symbol('OpenAIProvider'),
  GeminiProvider: Symbol('GeminiProvider'),
} as const;

export type TokenType = (typeof SERVICES)[keyof typeof SERVICES];
