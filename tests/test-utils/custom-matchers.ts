import type { ExpectationResult } from '@vitest/expect';

interface ICustomMatchers {
  expectOutputToContain(expectedStrings: string[]): void;
}

declare module 'vitest' {
  interface Assertion extends ICustomMatchers {}
  interface AsymmetricMatchersContaining extends ICustomMatchers {}
}

/**
 * Custom Vitest matchers for testing CLI output
 */
export const customMatchers = {
  /**
   * Check if all expected strings are present in the output
   * @param received - The actual output string
   * @param expectedStrings - Array of strings that should all be present
   * @returns Vitest expectation result
   */
  expectOutputToContain(
    received: string,
    expectedStrings: string[]
  ): ExpectationResult {
    const missingStrings = expectedStrings.filter(
      str => !received.includes(str)
    );

    if (missingStrings.length === 0) {
      return {
        pass: true,
        message: (): string =>
          `Expected output NOT to contain all strings, but it did`,
      };
    }

    return {
      pass: false,
      message: (): string => {
        const missing = missingStrings.map(str => `  - "${str}"`).join('\n');
        return (
          `Expected output to contain all strings.\n` +
          `Missing strings:\n${missing}\n\n` +
          `Received output:\n${received}`
        );
      },
    };
  },

  /**
   * Check if none of the strings are present in the output
   * @param received - The actual output string
   * @param unexpectedStrings - Array of strings that should not be present
   * @returns Vitest expectation result
   */
  expectOutputNotToContain(
    received: string,
    unexpectedStrings: string[]
  ): ExpectationResult {
    const foundStrings = unexpectedStrings.filter(str =>
      received.includes(str)
    );

    if (foundStrings.length === 0) {
      return {
        pass: true,
        message: (): string =>
          `Expected output to contain some strings, but it didn't`,
      };
    }

    return {
      pass: false,
      message: (): string => {
        const found = foundStrings.map(str => `  - "${str}"`).join('\n');
        return (
          `Expected output NOT to contain any of the strings.\n` +
          `Found strings:\n${found}\n\n` +
          `Received output:\n${received}`
        );
      },
    };
  },

  /**
   * Check if output matches a pattern with wildcards
   * @param received - The actual output string
   * @param pattern - Pattern with * wildcards
   * @returns Vitest expectation result
   */
  expectOutputToMatchPattern(
    received: string,
    pattern: string
  ): ExpectationResult {
    // Convert pattern to regex, escaping special chars except *
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');
    const regex = new RegExp(regexPattern);

    if (regex.test(received)) {
      return {
        pass: true,
        message: (): string =>
          `Expected output NOT to match pattern "${pattern}", but it did`,
      };
    }

    return {
      pass: false,
      message: (): string =>
        `Expected output to match pattern:\n  "${pattern}"\n\n` +
        `Received output:\n${received}`,
    };
  },
};
