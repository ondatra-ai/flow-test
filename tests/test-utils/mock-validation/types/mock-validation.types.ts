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

/**
 * Type for mock call validation options
 */
export interface MockValidationOptions {
  /** Whether to perform deep equality checks */
  deepEqual?: boolean;
  /** Whether to ignore extra properties in objects */
  ignoreExtraProperties?: boolean;
  /** Custom equality function */
  customEquality?: (expected: MockArgument, actual: MockArgument) => boolean;
}

/**
 * Type for mock call validation result
 */
export interface MockValidationResult {
  /** Whether the validation passed */
  passed: boolean;
  /** Error message if validation failed */
  message?: string;
  /** Details about the validation failure */
  details?: {
    expected: MockArgument[];
    actual: MockArgument[];
    failureReason: string;
  };
}

/**
 * Type for mock expectation configuration
 */
export interface MockExpectationConfig {
  /** Name of the mock for error messages */
  mockName: string;
  /** Validation options */
  options?: MockValidationOptions;
}
