/**
 * Type definitions for mock validation utilities
 */

/**
 * Represents any value that can be passed as a mock argument
 * This type replaces unsafe `any` and `unknown` usage in tests
 */
export type MockArgument = unknown;

/**
 * Type for mock validation operations
 */
export type MockValidationType =
  | 'exact'
  | 'pattern'
  | 'containing'
  | 'not-exact'
  | 'not-pattern'
  | 'not-containing';
