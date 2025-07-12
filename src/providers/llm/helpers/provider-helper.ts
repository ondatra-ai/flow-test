import type { IProviderHelper } from '../../../interfaces/providers/index.js';
import type { StreamEvent } from '../interfaces/provider.js';

// Re-export for backward compatibility
export type { IProviderHelper } from '../../../interfaces/providers/index.js';

export class ProviderHelper implements IProviderHelper {
  async streamToString(
    stream: AsyncIterableIterator<StreamEvent>
  ): Promise<string> {
    const tokens: string[] = [];

    for await (const event of stream) {
      if (event.type === 'token' && event.token) {
        tokens.push(event.token);
      } else if (event.type === 'error') {
        throw event.error || new Error('Unknown stream error');
      }
    }

    return tokens.join('');
  }

  checkAbortSignal(signal: AbortSignal): void {
    if (signal.aborted) {
      throw new Error('Operation aborted');
    }
  }

  wrapError(error: Error, signal: AbortSignal): StreamEvent {
    if (signal.aborted) {
      return {
        type: 'error',
        error: new Error('Stream cancelled'),
      };
    }
    return {
      type: 'error',
      error,
    };
  }
}
