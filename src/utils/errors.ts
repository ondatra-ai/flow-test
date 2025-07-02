/**
 * Base error class for all application errors
 */
export abstract class BaseError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Configuration-related errors
 */
export class ConfigurationError extends BaseError {
  constructor(
    message: string,
    context?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, 'CONFIGURATION_ERROR', context, cause);
  }
}

/**
 * Flow execution errors
 */
export class FlowExecutionError extends BaseError {
  constructor(
    message: string,
    context?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, 'FLOW_EXECUTION_ERROR', context, cause);
  }
}

/**
 * MCP server communication errors
 */
export class McpServerError extends BaseError {
  constructor(
    message: string,
    context?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, 'MCP_SERVER_ERROR', context, cause);
  }
}

/**
 * Validation errors
 */
export class ValidationError extends BaseError {
  constructor(
    message: string,
    context?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, 'VALIDATION_ERROR', context, cause);
  }
}
