import type { Mock } from 'vitest';

import { cast } from '../../../src/utils/cast.js';

import { CallExpectation } from './call-expectation.js';
import { MockValidationError } from './mock-validation-error.js';
import type { INegatedMockCallExpectation } from './types/mock-validation.interface.js';
import type { MockArgument } from './types/mock-validation.types.js';

/**
 * Negated mock call expectation for NOT assertions
 * Provides type-safe negated validation without unsafe type assertions
 */
export class NegatedMockCallExpectation implements INegatedMockCallExpectation {
  private readonly mock: Mock;
  private readonly mockName: string;

  constructor(mock: Mock, mockName: string) {
    this.mock = mock;
    this.mockName = mockName;
  }

  /**
   * Expect the mock NOT to have been called with exact arguments
   */
  toHaveBeenCalledWith(...expectedArgs: MockArgument[]): void {
    const calls = this.mock.mock.calls;

    for (const call of calls) {
      const callArgs = call.map(arg => cast<MockArgument>(arg));
      const callExpectation = new CallExpectation(callArgs);

      if (callExpectation.toMatch(...expectedArgs)) {
        throw new MockValidationError(
          this.mockName,
          expectedArgs,
          calls.map(c => c.map(arg => cast<MockArgument>(arg))),
          'not-exact',
          `Expected mock "${this.mockName}" NOT to have been called with exact arguments, but it was`
        );
      }
    }
  }

  /**
   * Expect the mock NOT to have been called with arguments matching a pattern
   */
  toHaveBeenCalledWithMatch(pattern: Record<string, MockArgument>): void {
    const calls = this.mock.mock.calls;

    for (const call of calls) {
      const callArgs = call.map(arg => cast<MockArgument>(arg));
      const callExpectation = new CallExpectation(callArgs);

      if (callExpectation.toMatchPattern(pattern)) {
        throw new MockValidationError(
          this.mockName,
          Object.values(pattern),
          calls.map(c => c.map(arg => cast<MockArgument>(arg))),
          'not-pattern',
          `Expected mock "${this.mockName}" NOT to have been called with arguments matching pattern, but it was`
        );
      }
    }
  }

  /**
   * Expect the mock NOT to have been called with arguments containing specified values
   */
  toHaveBeenCalledWithContaining(partial: Record<string, MockArgument>): void {
    const calls = this.mock.mock.calls;

    for (const call of calls) {
      const callArgs = call.map(arg => cast<MockArgument>(arg));
      const callExpectation = new CallExpectation(callArgs);

      if (callExpectation.toContain(partial)) {
        throw new MockValidationError(
          this.mockName,
          Object.values(partial),
          calls.map(c => c.map(arg => cast<MockArgument>(arg))),
          'not-containing',
          `Expected mock "${this.mockName}" NOT to have been called with ` +
            'arguments containing specified values, but it was'
        );
      }
    }
  }
}
