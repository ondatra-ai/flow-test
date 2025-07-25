import type { IStreamEvent } from './provider.interface.js';

export interface IProviderHelper {
  /**
   * Convert a stream to a complete string response
   */
  streamToString(stream: AsyncIterableIterator<IStreamEvent>): Promise<string>;

  /**
   * Check abort signal and throw if aborted
   */
  checkAbortSignal(signal: AbortSignal): void;

  /**
   * Wrap errors with abort signal context
   */
  wrapError(error: Error, signal: AbortSignal): IStreamEvent;
}
