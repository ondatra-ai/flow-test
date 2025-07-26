import type {
  MockArgument,
  MockValidationType,
} from './mock-validation.types.js';

/**
 * Mock validation interfaces for type-safe mock argument validation
 */

/**
 * Interface for mock call expectations with fluent API
 */
export interface IMockCallExpectation {
  /**
   * Expect the mock to have been called with exact arguments
   */
  toHaveBeenCalledWith(...expectedArgs: MockArgument[]): void;

  /**
   * Expect the mock to have been called with arguments matching a pattern
   */
  toHaveBeenCalledWithMatch(pattern: Record<string, MockArgument>): void;

  /**
   * Expect the mock to have been called with arguments containing specified values
   */
  toHaveBeenCalledWithContaining(partial: Record<string, MockArgument>): void;

  /**
   * Access negated expectations
   */
  readonly not: INegatedMockCallExpectation;
}

/**
 * Interface for negated mock call expectations
 */
export interface INegatedMockCallExpectation {
  /**
   * Expect the mock NOT to have been called with exact arguments
   */
  toHaveBeenCalledWith(...expectedArgs: MockArgument[]): void;

  /**
   * Expect the mock NOT to have been called with arguments matching a pattern
   */
  toHaveBeenCalledWithMatch(pattern: Record<string, MockArgument>): void;

  /**
   * Expect the mock NOT to have been called with arguments containing specified values
   */
  toHaveBeenCalledWithContaining(partial: Record<string, MockArgument>): void;
}

/**
 * Interface for call-specific expectations
 */
export interface ICallExpectation {
  /**
   * Verify exact argument match
   */
  toMatch(...expectedArgs: MockArgument[]): boolean;

  /**
   * Verify pattern-based argument match
   */
  toMatchPattern(pattern: Record<string, MockArgument>): boolean;

  /**
   * Verify arguments contain specified values
   */
  toContain(partial: Record<string, MockArgument>): boolean;
}

/**
 * Interface for mock validation error with detailed information
 */
export interface IMockValidationError extends Error {
  readonly mockName: string;
  readonly expectedArgs: MockArgument[];
  readonly actualCalls: MockArgument[][];
  readonly validationType: MockValidationType;
}

/**
 * Matcher interface for asymmetric matching
 */
export interface IAsymmetricMatcher {
  asymmetricMatch: (value: MockArgument) => boolean;
  toString: () => string;
}
