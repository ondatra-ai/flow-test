import { cast } from '../../../src/utils/cast.js';

import type { ICallExpectation } from './types/mock-validation.interface.js';
import type { MockArgument } from './types/mock-validation.types.js';

/**
 * Type guard to check if a value is a record of MockArguments
 */
function isRecordOfMockArgument(
  value: unknown
): value is Record<string, MockArgument> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

/**
 * Call expectation utility for validating individual mock calls
 * Provides type-safe argument validation without unsafe type assertions
 */
export class CallExpectation implements ICallExpectation {
  private readonly args: MockArgument[];

  constructor(args: MockArgument[]) {
    this.args = args;
  }

  /**
   * Verify exact argument match
   */
  toMatch(...expectedArgs: MockArgument[]): boolean {
    if (this.args.length !== expectedArgs.length) {
      return false;
    }

    return this.args.every((arg, index) =>
      this.deepEqual(arg, expectedArgs[index])
    );
  }

  /**
   * Verify pattern-based argument match
   * Checks if arguments match a specific structure
   */
  toMatchPattern(pattern: Record<string, MockArgument>): boolean {
    if (this.args.length === 0) {
      return Object.keys(pattern).length === 0;
    }

    // For single argument that's an object, match against pattern
    if (this.args.length === 1 && isRecordOfMockArgument(this.args[0])) {
      return this.matchObjectPattern(
        cast<Record<string, MockArgument>>(this.args[0]),
        pattern
      );
    }

    // For multiple arguments, treat as indexed pattern
    const indexedArgs: Record<string, MockArgument> = {};
    this.args.forEach((arg, index) => {
      indexedArgs[index.toString()] = arg;
    });

    return this.matchObjectPattern(indexedArgs, pattern);
  }

  /**
   * Verify arguments contain specified values
   * Checks if arguments contain all specified key-value pairs
   */
  toContain(partial: Record<string, MockArgument>): boolean {
    if (this.args.length === 0) {
      return Object.keys(partial).length === 0;
    }

    // For single argument that's an object, check containment
    if (
      this.args.length === 1 &&
      typeof this.args[0] === 'object' &&
      this.args[0] !== null
    ) {
      return this.containsValues(
        cast<Record<string, MockArgument>>(this.args[0]),
        partial
      );
    }

    // For multiple arguments, treat as indexed containment
    const indexedArgs: Record<string, MockArgument> = {};
    this.args.forEach((arg, index) => {
      indexedArgs[index.toString()] = arg;
    });

    return this.containsValues(indexedArgs, partial);
  }

  /**
   * Deep equality comparison for mock arguments
   */
  private deepEqual(a: MockArgument, b: MockArgument): boolean {
    // Handle asymmetric matchers
    if (this.isAsymmetricMatcher(b)) {
      const matcher = cast<{
        asymmetricMatch: (value: MockArgument) => boolean;
      }>(b);
      return matcher.asymmetricMatch(a);
    }

    // Primitive comparison
    if (a === b) return true;

    // Null/undefined handling
    if (this.isNullOrUndefined(a) || this.isNullOrUndefined(b)) {
      return false;
    }

    // Array comparison
    if (Array.isArray(a) && Array.isArray(b)) {
      return this.compareArrays(a, b);
    }

    // Object comparison
    if (
      typeof a === 'object' &&
      typeof b === 'object' &&
      a !== null &&
      b !== null
    ) {
      return this.compareObjects(a, b);
    }

    return false;
  }

  /**
   * Check if value is an asymmetric matcher
   */
  private isAsymmetricMatcher(value: MockArgument): boolean {
    return (
      typeof value === 'object' && value !== null && 'asymmetricMatch' in value
    );
  }

  /**
   * Check if value is null or undefined
   */
  private isNullOrUndefined(value: MockArgument): boolean {
    return value === null || value === undefined;
  }

  /**
   * Compare two arrays for deep equality
   */
  private compareArrays(a: unknown[], b: unknown[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((item, index) => this.deepEqual(item, b[index]));
  }

  /**
   * Compare two objects for deep equality
   */
  private compareObjects(a: object, b: object): boolean {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every(key => {
      const valueA = cast<MockArgument>(
        (a as Record<string, MockArgument>)[key]
      );
      const valueB = cast<MockArgument>(
        (b as Record<string, MockArgument>)[key]
      );
      return this.deepEqual(valueA, valueB);
    });
  }

  /**
   * Match object against pattern
   */
  private matchObjectPattern(
    obj: Record<string, MockArgument>,
    pattern: Record<string, MockArgument>
  ): boolean {
    return Object.keys(pattern).every(key => {
      const expectedValue = pattern[key];
      const actualValue = obj[key];
      return this.deepEqual(actualValue, expectedValue);
    });
  }

  /**
   * Check if object contains all specified values
   */
  private containsValues(
    obj: Record<string, MockArgument>,
    partial: Record<string, MockArgument>
  ): boolean {
    return Object.keys(partial).every(key => {
      const expectedValue = partial[key];
      const actualValue = obj[key];
      return this.deepEqual(actualValue, expectedValue);
    });
  }
}
