import { vi } from 'vitest';

import type { ILogger } from '../../../../src/interfaces/utils/logger.interface.js';
import { cast } from '../../../../src/utils/cast.js';
import type { ILoggerMockOptions, ILoggerMockResult } from '../types.js';

/**
 * Creates a Logger mock with simple property access pattern
 *
 * @example
 * const loggerMock = createLoggerMock();
 *
 * // For injection
 * const step = new Step('id', loggerMock.mock);
 *
 * // For assertions
 * expect(loggerMock.info).toHaveBeenCalledWith('message');
 * expect(loggerMock.error).toHaveBeenCalledWith('error msg', error);
 */
export function createLoggerMock(
  options?: ILoggerMockOptions
): ILoggerMockResult {
  const info = vi.fn();
  const error = vi.fn();
  const warn = vi.fn();
  const debug = vi.fn();
  const log = vi.fn();

  const mock = cast<ILogger>({
    info,
    error,
    warn,
    debug,
    log,
    // Apply any custom behavior overrides
    ...options?.customBehavior,
  });

  // Return object designed for simple property access
  return {
    mock, // For injection
    info, // For assertions
    error,
    warn,
    debug,
    log,
  };
}
