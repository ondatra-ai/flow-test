import type { Mock } from 'vitest';

import { MockCallExpectation } from './mock-call-expectation.js';
import type { IMockCallExpectation } from './types/mock-validation.interface.js';

/**
 * Main entry point for mock call validation
 * Provides type-safe mock validation without unsafe type assertions
 *
 * @param mock - The Vitest mock to validate
 * @param mockName - Optional name for the mock (used in error messages)
 * @returns A mock call expectation object with fluent API
 *
 * @example
 * ```typescript
 * const mockFn = vi.fn();
 * mockFn('test', { id: 1 });
 *
 * // Exact match
 * expectMockCall(mockFn).toHaveBeenCalledWith('test', { id: 1 });
 *
 * // Pattern match
 * expectMockCall(mockFn).toHaveBeenCalledWithMatch({ '0': 'test' });
 *
 * // Containing values
 * expectMockCall(mockFn).toHaveBeenCalledWithContaining({ id: 1 });
 *
 * // Negated assertions
 * expectMockCall(mockFn).not.toHaveBeenCalledWith('wrong');
 * ```
 */
export function expectMockCall(
  mock: Mock,
  mockName?: string
): IMockCallExpectation {
  const name = mockName || mock.getMockName() || 'Unknown Mock';
  return new MockCallExpectation(mock, name);
}

/**
 * Type guard to check if a value is a Mock
 */
export function isMock(value: unknown): value is Mock {
  return (
    typeof value === 'object' &&
    value !== null &&
    'mock' in value &&
    typeof value.mock === 'object' &&
    value.mock !== null &&
    'calls' in value.mock &&
    Array.isArray((value.mock as { calls: unknown }).calls)
  );
}

/**
 * Utility to create a named mock for better error messages
 *
 * @param mockFn - The mock function
 * @param name - Name to assign to the mock
 * @returns The same mock function with the name set
 */
export function namedMock<T extends Mock>(mockFn: T, name: string): T {
  mockFn.mockName(name);
  return mockFn;
}
