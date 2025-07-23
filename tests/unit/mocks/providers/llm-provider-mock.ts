import { vi } from 'vitest';

import type { ILLMProvider } from '../../../../src/interfaces/providers/provider.interface.js';
import { cast } from '../../../../src/utils/cast.js';
import type {
  LLMProviderMockOptions,
  LLMProviderMockResult,
} from '../types.js';

/**
 * Creates an LLM Provider mock with simple property access pattern
 *
 * @example
 * const providerMock = createLLMProviderMock();
 *
 * // For injection
 * const step = new Step('id', providerMock.mock);
 *
 * // For assertions
 * expect(providerMock.generate).toHaveBeenCalledWith(request);
 * expect(providerMock.stream).toHaveBeenCalled();
 *
 * @example
 * // Custom behavior setup
 * const providerMock = createLLMProviderMock({
 *   setupBehavior: (mocks) => {
 *     mocks.generate.mockResolvedValue('Custom response');
 *     // Access call arguments easily:
 *     // const callArgs = mocks.generate.mock.calls[0][0];
 *   }
 * });
 */
export function createLLMProviderMock(
  options?: LLMProviderMockOptions
): LLMProviderMockResult {
  const stream = vi.fn();
  const generate = vi.fn();
  const getProviderName = vi.fn();
  const getAvailableModels = vi.fn();

  // Set up default behaviors
  if (options?.defaultResponse) {
    generate.mockResolvedValue(options.defaultResponse);
  }

  if (options?.simulateError) {
    generate.mockRejectedValue(new Error('Simulated LLM error'));
    stream.mockImplementation(function* () {
      yield { content: 'error', delta: 'error' };
      throw new Error('Simulated LLM stream error');
    });
  }

  if (options?.providerName) {
    getProviderName.mockReturnValue(options.providerName);
  }

  if (options?.availableModels) {
    getAvailableModels.mockReturnValue(options.availableModels);
  }

  const mock = cast<ILLMProvider>({
    stream,
    generate,
    getProviderName,
    getAvailableModels,
    // Apply any custom behavior overrides
    ...options?.customBehavior,
  });

  // Apply setup behavior if provided
  if (options?.setupBehavior) {
    options.setupBehavior({
      stream,
      generate,
      getProviderName,
      getAvailableModels,
    });
  }

  // Return object designed for simple property access
  return {
    mock, // For injection
    stream, // For assertions
    generate,
    getProviderName,
    getAvailableModels,
  };
}
