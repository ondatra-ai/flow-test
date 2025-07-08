export class SignalUtils {
  /**
   * Create a signal that never aborts (for unlimited operations)
   */
  static neverAbort(): AbortSignal {
    return new AbortController().signal;
  }

  /**
   * Create a signal with timeout
   */
  static timeout(ms: number): AbortSignal {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  }

  /**
   * Create a signal with timeout and return controller for manual abort
   */
  static timeoutWithController(ms: number): {
    signal: AbortSignal;
    controller: AbortController;
  } {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ms);

    // Clean up timeout if manually aborted
    controller.signal.addEventListener('abort', () => clearTimeout(timeoutId));

    return { signal: controller.signal, controller };
  }

  /**
   * Merge multiple signals - aborts when any signal aborts
   */
  static merge(...signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();

    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort();
        return controller.signal;
      }

      signal.addEventListener('abort', () => controller.abort(), {
        once: true,
      });
    }

    return controller.signal;
  }

  /**
   * Create a signal that aborts after N tokens
   */
  static tokenLimit(maxTokens: number): {
    signal: AbortSignal;
    increment: () => void;
  } {
    const controller = new AbortController();
    let tokenCount = 0;

    return {
      signal: controller.signal,
      increment: (): void => {
        tokenCount++;
        if (tokenCount >= maxTokens) {
          controller.abort();
        }
      },
    };
  }
}
