import type { Command } from 'commander';
import { vi } from 'vitest';

import { cast } from '../../../../src/utils/cast.js';
import type { CommandMockOptions, CommandMockResult } from '../types.js';

/**
 * Creates a Command mock with simple property access pattern
 *
 * @example
 * const commandMock = createCommandMock();
 *
 * // For injection
 * setupCLI(commandMock.mock);
 *
 * // For assertions
 * expect(commandMock.action).toHaveBeenCalled();
 * expect(commandMock.description).toHaveBeenCalledWith('desc');
 */
export function createCommandMock(
  options?: CommandMockOptions
): CommandMockResult {
  const name = vi.fn();
  const description = vi.fn();
  const version = vi.fn();
  const command = vi.fn();
  const argument = vi.fn();
  const option = vi.fn();
  const action = vi.fn();

  // Set up chainable behaviors if specified
  if (options?.chainable) {
    const mockInstance = {
      name,
      description,
      version,
      command,
      argument,
      option,
      action,
    };

    // Make methods return the mock instance for chaining
    name.mockReturnValue(mockInstance);
    description.mockReturnValue(mockInstance);
    version.mockReturnValue(mockInstance);
    command.mockReturnValue(mockInstance);
    argument.mockReturnValue(mockInstance);
    option.mockReturnValue(mockInstance);
    action.mockReturnValue(mockInstance);
  }

  if (options?.defaultAction) {
    action.mockImplementation(options.defaultAction);
  }

  const mock = cast<Command>({
    name,
    description,
    version,
    command,
    argument,
    option,
    action,
    // Apply any custom behavior overrides
    ...options?.customBehavior,
  });

  // Return object designed for simple property access
  return {
    mock, // For injection
    name, // For assertions
    description,
    version,
    command,
    argument,
    option,
    action,
  };
}
