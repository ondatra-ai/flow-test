/**
 * Dependency injection tokens using symbols for type safety
 *
 * Using symbols prevents typos and provides better type safety
 * compared to hard-coded string tokens.
 */

export const TOKENS = {
  Logger: Symbol('Logger'),
} as const;

export type TokenType = (typeof TOKENS)[keyof typeof TOKENS];
