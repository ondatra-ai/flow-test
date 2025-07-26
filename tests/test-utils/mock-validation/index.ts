/**
 * Mock Validation Utilities
 *
 * Provides type-safe mock argument validation without unsafe type assertions.
 * Replaces usage of `as any` and `as unknown` in test files with proper typing.
 *
 * @example
 * ```typescript
 * import { expectMockCall } from '../test-utils/mock-validation';
 *
 * const mockFn = vi.fn();
 * mockFn('test', { id: 1 });
 *
 * // Use type-safe validation instead of unsafe assertions
 * expectMockCall(mockFn).toHaveBeenCalledWith('test', { id: 1 });
 * expectMockCall(mockFn).not.toHaveBeenCalledWith('wrong');
 * ```
 */

// Main API
export { expectMockCall, isMock, namedMock } from './expect-mock-call.js';

// Type definitions
export type {
  IMockCallExpectation,
  INegatedMockCallExpectation,
  ICallExpectation,
  IMockValidationError,
  IAsymmetricMatcher,
} from './types/mock-validation.interface.js';

export type {
  MockArgument,
  MockValidationType,
} from './types/mock-validation.types.js';

// Error class for advanced usage
export { MockValidationError } from './mock-validation-error.js';

// Implementation classes for advanced usage
export { MockCallExpectation } from './mock-call-expectation.js';
export { NegatedMockCallExpectation } from './negated-mock-call-expectation.js';
export { CallExpectation } from './call-expectation.js';
