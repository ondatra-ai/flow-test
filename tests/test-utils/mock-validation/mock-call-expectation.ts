import type { Mock } from 'vitest';

import { CallExpectation } from './call-expectation.js';
import { MockValidationError } from './mock-validation-error.js';
import { NegatedMockCallExpectation } from './negated-mock-call-expectation.js';
import type { IMockCallExpectation } from './types/mock-validation.interface.js';
import type { MockArgument } from './types/mock-validation.types.js';

/**
 * Helper function to convert mock calls to MockArgument arrays
 * Since MockArgument is `unknown`, this is primarily for type clarity
 */
function convertMockCalls(calls: readonly unknown[][]): MockArgument[][] {
  return calls.map(call => call);
}

/**
 * Main mock call expectation implementation
 * Provides fluent API for type-safe mock validation without unsafe type assertions
 */
export class MockCallExpectation implements IMockCallExpectation {
  private readonly mock: Mock;
  private readonly mockName: string;
  private readonly _not: NegatedMockCallExpectation;

  constructor(mock: Mock, mockName: string) {
    this.mock = mock;
    this.mockName = mockName;
    this._not = new NegatedMockCallExpectation(mock, mockName);
  }

  /**
   * Access negated expectations
   */
  get not(): NegatedMockCallExpectation {
    return this._not;
  }

  /**
   * Expect the mock to have been called with exact arguments
   */
  toHaveBeenCalledWith(...expectedArgs: MockArgument[]): void {
    const calls = this.mock.mock.calls;

    if (calls.length === 0) {
      throw new MockValidationError(
        this.mockName,
        expectedArgs,
        [],
        'exact',
        `Expected mock "${this.mockName}" to have been called with arguments, but it was never called`
      );
    }

    const hasMatchingCall = calls.some(call => {
      const callExpectation = new CallExpectation(call as MockArgument[]);
      return callExpectation.toMatch(...expectedArgs);
    });

    if (!hasMatchingCall) {
      throw new MockValidationError(
        this.mockName,
        expectedArgs,
        convertMockCalls(calls),
        'exact'
      );
    }
  }

  /**
   * Expect the mock to have been called with arguments matching a pattern
   */
  toHaveBeenCalledWithMatch(pattern: Record<string, MockArgument>): void {
    const calls = this.mock.mock.calls;

    if (calls.length === 0) {
      throw new MockValidationError(
        this.mockName,
        Object.values(pattern),
        [],
        'pattern',
        `Expected mock "${this.mockName}" to have been called with arguments matching pattern, but it was never called`
      );
    }

    const hasMatchingCall = calls.some(call => {
      const callExpectation = new CallExpectation(call as MockArgument[]);
      return callExpectation.toMatchPattern(pattern);
    });

    if (!hasMatchingCall) {
      throw new MockValidationError(
        this.mockName,
        Object.values(pattern),
        convertMockCalls(calls),
        'pattern'
      );
    }
  }

  /**
   * Expect the mock to have been called with arguments containing specified values
   */
  toHaveBeenCalledWithContaining(partial: Record<string, MockArgument>): void {
    const calls = this.mock.mock.calls;

    if (calls.length === 0) {
      throw new MockValidationError(
        this.mockName,
        Object.values(partial),
        [],
        'containing',
        `Expected mock "${this.mockName}" to have been called with arguments ` +
          'containing specified values, but it was never called'
      );
    }

    const hasMatchingCall = calls.some(call => {
      const callExpectation = new CallExpectation(call as MockArgument[]);
      return callExpectation.toContain(partial);
    });

    if (!hasMatchingCall) {
      throw new MockValidationError(
        this.mockName,
        Object.values(partial),
        convertMockCalls(calls),
        'containing'
      );
    }
  }
}
