/**
 * Common validation utilities for the flow system
 */
export class ValidationUtils {
  /**
   * Type guard for record objects
   */
  static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * Type guard for non-empty strings
   */
  static isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0;
  }

  /**
   * Validate that a value is a non-empty string
   */
  static validateStringField(
    value: unknown,
    fieldName: string,
    context?: string
  ): string {
    if (!this.isNonEmptyString(value)) {
      const prefix = context ? `${context} ` : '';
      throw new Error(
        `${prefix}field '${fieldName}' must be a non-empty string`
      );
    }
    return value;
  }

  /**
   * Validate that a value is one of the allowed enum values
   */
  static validateEnumField<T extends string>(
    value: unknown,
    allowedValues: readonly T[],
    fieldName: string,
    context?: string
  ): T {
    if (!allowedValues.includes(value as T)) {
      const prefix = context ? `${context} ` : '';
      throw new Error(
        `${prefix}field '${fieldName}' must be one of: ${allowedValues.join(', ')}`
      );
    }
    return value as T;
  }

  /**
   * Validate that a value exists and is not null/undefined
   */
  static validateRequired<T>(
    value: T | null | undefined,
    fieldName: string,
    context?: string
  ): T {
    if (value === null || value === undefined) {
      const prefix = context ? `${context} ` : '';
      throw new Error(`${prefix}field '${fieldName}' is required`);
    }
    return value;
  }

  /**
   * Validate that an object has required fields
   */
  static validateRequiredFields(
    obj: Record<string, unknown>,
    requiredFields: string[],
    context?: string
  ): void {
    for (const field of requiredFields) {
      if (!(field in obj) || obj[field] === null || obj[field] === undefined) {
        const prefix = context ? `${context} ` : '';
        throw new Error(`${prefix}missing required field: ${field}`);
      }
    }
  }

  /**
   * Create a validation error with consistent formatting
   */
  static createValidationError(message: string, context?: string): Error {
    const prefix = context ? `${context}: ` : '';
    return new Error(`${prefix}${message}`);
  }

  /**
   * Validate that a value is a proper object (not null, not array)
   */
  static validateObjectField(
    value: unknown,
    fieldName: string,
    context?: string
  ): Record<string, unknown> {
    if (!this.isRecord(value)) {
      const prefix = context ? `${context} ` : '';
      throw new Error(`${prefix}field '${fieldName}' must be an object`);
    }
    return value;
  }

  /**
   * Safely convert unknown to string for error messages
   */
  static toString(value: unknown): string {
    if (typeof value === 'string') return value;
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (typeof value === 'object') {
      return '[object]';
    }
    // For functions and other types, return a safe representation
    return `[${typeof value}]`;
  }
}

/**
 * Error class for validation failures
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly context?: string
  ) {
    super(context ? `${context}: ${message}` : message);
    this.name = 'ValidationError';
  }
}
