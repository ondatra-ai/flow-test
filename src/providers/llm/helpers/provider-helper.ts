import type { StreamEvent } from '../interfaces/provider.js';

export interface IProviderHelper {
  /**
   * Convert a stream to a complete string response
   */
  streamToString(stream: AsyncIterableIterator<StreamEvent>): Promise<string>;

  /**
   * Check abort signal and throw if aborted
   */
  checkAbortSignal(signal: AbortSignal): void;

  /**
   * Wrap errors with abort signal context
   */
  wrapError(error: Error, signal: AbortSignal): StreamEvent;
}

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
