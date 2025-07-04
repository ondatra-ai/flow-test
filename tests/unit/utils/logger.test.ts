import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, MockInstance } from 'vitest';

import { ConsoleLogger, LogLevel } from '../../../src/utils/logger';

describe('ConsoleLogger', () => {
  let consoleLogSpy: MockInstance;
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should log error messages', () => {
    const logger = new ConsoleLogger(LogLevel.ERROR);
    logger.error('Test error message');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('ERROR: Test error message')
    );
  });

  it('should respect log level filtering', () => {
    const logger = new ConsoleLogger(LogLevel.ERROR);
    logger.info('Test info message');

    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('should include metadata in log output', () => {
    const logger = new ConsoleLogger(LogLevel.INFO);
    const meta = { userId: '123', action: 'login' };
    logger.info('User action', meta);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(JSON.stringify(meta))
    );
  });
});
