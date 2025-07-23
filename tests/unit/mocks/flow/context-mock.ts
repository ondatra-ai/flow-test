import { vi } from 'vitest';

import type { IContext } from '../../../../src/interfaces/flow/context.interface.js';
import { cast } from '../../../../src/utils/cast.js';
import type { ContextMockOptions, ContextMockResult } from '../types.js';

/**
 * Creates a Context mock with simple property access pattern
 *
 * @example
 * const contextMock = createContextMock();
 *
 * // For injection
 * const step = new Step('id', contextMock.mock);
 *
 * // For assertions
 * expect(contextMock.get).toHaveBeenCalledWith('key');
 * expect(contextMock.set).toHaveBeenCalledWith('key', 'value');
 *
 * @example
 * // Custom behavior setup
 * const contextMock = createContextMock({
 *   setupBehavior: (mocks) => {
 *     mocks.get
 *       .mockReturnValueOnce('Issue Title')
 *       .mockReturnValueOnce('Issue Body')
 *       .mockReturnValue(undefined);
 *   }
 * });
 */
export function createContextMock(
  options?: ContextMockOptions
): ContextMockResult {
  const get = vi.fn();
  const set = vi.fn();
  const has = vi.fn();
  const deleteMethod = vi.fn();
  const clear = vi.fn();

  // Set up default behaviors
  if (options?.initialData) {
    const data = new Map(Object.entries(options.initialData));
    get.mockImplementation((key: string) => data.get(key));
    has.mockImplementation((key: string) => data.has(key));
    set.mockImplementation((key: string, value: string) => {
      data.set(key, value);
    });
    deleteMethod.mockImplementation((key: string) => data.delete(key));
    clear.mockImplementation(() => data.clear());
  }

  const mock = cast<IContext>({
    get,
    set,
    has,
    delete: deleteMethod,
    clear,
    // Apply any custom behavior overrides
    ...options?.customBehavior,
  });

  // Apply setup behavior if provided
  if (options?.setupBehavior) {
    options.setupBehavior({ get, set, has, delete: deleteMethod, clear });
  }

  // Return object designed for simple property access
  return {
    mock, // For injection
    get, // For assertions
    set,
    has,
    delete: deleteMethod,
    clear,
  };
}
