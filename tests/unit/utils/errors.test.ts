import { describe, it, expect } from 'vitest';

import {
  ConfigurationError,
  FlowExecutionError,
  McpServerError,
  ValidationError,
} from '../../../src/utils/errors';

describe('Custom Errors', () => {
  it('should create ConfigurationError with correct properties', () => {
    const context = { configFile: 'test.json' };
    const error = new ConfigurationError('Invalid configuration', context);

    expect(error.name).toBe('ConfigurationError');
    expect(error.code).toBe('CONFIGURATION_ERROR');
    expect(error.message).toBe('Invalid configuration');
    expect(error.context).toEqual(context);
  });

  it('should create FlowExecutionError with correct properties', () => {
    const error = new FlowExecutionError('Flow failed');

    expect(error.name).toBe('FlowExecutionError');
    expect(error.code).toBe('FLOW_EXECUTION_ERROR');
    expect(error.message).toBe('Flow failed');
  });

  it('should create McpServerError with correct properties', () => {
    const error = new McpServerError('Server connection failed');

    expect(error.name).toBe('McpServerError');
    expect(error.code).toBe('MCP_SERVER_ERROR');
  });

  it('should create ValidationError with correct properties', () => {
    const error = new ValidationError('Validation failed');

    expect(error.name).toBe('ValidationError');
    expect(error.code).toBe('VALIDATION_ERROR');
  });
});
