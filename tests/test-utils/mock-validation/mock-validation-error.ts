import type { IMockValidationError } from './types/mock-validation.interface.js';
import type {
  MockArgument,
  MockValidationType,
} from './types/mock-validation.types.js';

/**
 * Custom error class for mock validation failures
 * Provides detailed information about validation failures for better debugging
 */
export class MockValidationError extends Error implements IMockValidationError {
  readonly mockName: string;
  readonly expectedArgs: MockArgument[];
  readonly actualCalls: MockArgument[][];
  readonly validationType: MockValidationType;

  constructor(
    mockName: string,
    expectedArgs: MockArgument[],
    actualCalls: MockArgument[][],
    validationType: MockValidationType,
    customMessage?: string
  ) {
    const message =
      customMessage ||
      MockValidationError.generateMessage(
        mockName,
        expectedArgs,
        actualCalls,
        validationType
      );

    super(message);
    this.name = 'MockValidationError';
    this.mockName = mockName;
    this.expectedArgs = expectedArgs;
    this.actualCalls = actualCalls;
    this.validationType = validationType;

    // Maintain proper stack trace for V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MockValidationError);
    }
  }

  /**
   * Generate a detailed error message for the validation failure
   */
  private static generateMessage(
    mockName: string,
    expectedArgs: MockArgument[],
    actualCalls: MockArgument[][],
    validationType: MockValidationType
  ): string {
    const operation =
      MockValidationError.getOperationDescription(validationType);
    const expectedArgsStr = MockValidationError.formatArgs(expectedArgs);
    const actualCallsStr = MockValidationError.formatCalls(actualCalls);

    return [
      `Mock validation failed for "${mockName}"`,
      `Expected: ${operation} ${expectedArgsStr}`,
      `Actual calls: ${actualCallsStr}`,
      `Call count: ${actualCalls.length}`,
    ].join('\n');
  }

  /**
   * Get human-readable description of the validation operation
   */
  private static getOperationDescription(
    validationType: MockValidationType
  ): string {
    switch (validationType) {
      case 'exact':
        return 'to have been called with exact arguments';
      case 'pattern':
        return 'to have been called with arguments matching pattern';
      case 'containing':
        return 'to have been called with arguments containing';
      case 'not-exact':
        return 'NOT to have been called with exact arguments';
      case 'not-pattern':
        return 'NOT to have been called with arguments matching pattern';
      case 'not-containing':
        return 'NOT to have been called with arguments containing';
      default:
        return 'unknown validation operation';
    }
  }

  /**
   * Format arguments for display in error messages
   */
  private static formatArgs(args: MockArgument[]): string {
    return `[${args.map(arg => MockValidationError.formatArg(arg)).join(', ')}]`;
  }

  /**
   * Format multiple calls for display in error messages
   */
  private static formatCalls(calls: MockArgument[][]): string {
    if (calls.length === 0) {
      return '(no calls)';
    }
    return calls.map(call => MockValidationError.formatArgs(call)).join(', ');
  }

  /**
   * Format a single argument for display
   */
  private static formatArg(arg: MockArgument): string {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'string') return `"${arg}"`;
    if (typeof arg === 'object' && arg !== null && 'asymmetricMatch' in arg) {
      const matcher = arg as { toString(): string };
      return matcher.toString();
    }
    try {
      return JSON.stringify(arg);
    } catch {
      return typeof arg === 'object' && arg !== null
        ? '[object Object]'
        : String(arg);
    }
  }
}
