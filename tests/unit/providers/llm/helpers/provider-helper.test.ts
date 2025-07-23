// tests/unit/providers/llm/helpers/provider-helper.test.ts

import { describe, it, expect } from 'vitest';

import { ProviderHelper } from '../../../../../src/providers/llm/helpers/provider-helper.js';
import type { StreamEvent } from '../../../../../src/providers/llm/interfaces/provider.js';

describe('ProviderHelper.streamToString', () => {
  const helper = new ProviderHelper();

  it('should convert token stream to string', async () => {
    async function* mockStream(): AsyncIterableIterator<StreamEvent> {
      yield { type: 'token', token: 'Hello' };
      yield { type: 'token', token: ' ' };
      yield { type: 'token', token: 'world' };
      yield { type: 'done' };
    }

    const result = await helper.streamToString(mockStream());
    expect(result).toBe('Hello world');
  });

  it('should include all tokens regardless of done event', async () => {
    async function* mockStream(): AsyncIterableIterator<StreamEvent> {
      yield { type: 'token', token: 'Hello' };
      yield { type: 'done' };
      yield { type: 'token', token: ' ignored' };
    }

    const result = await helper.streamToString(mockStream());
    expect(result).toBe('Hello ignored');
  });

  it('should throw on error event', async () => {
    async function* mockStream(): AsyncIterableIterator<StreamEvent> {
      yield { type: 'token', token: 'Start' };
      yield {
        type: 'error',
        error: new Error('Stream error'),
      };
    }

    await expect(helper.streamToString(mockStream())).rejects.toThrow(
      'Stream error'
    );
  });
});

describe('ProviderHelper.checkAbortSignal', () => {
  const helper = new ProviderHelper();

  it('should throw when signal is aborted', () => {
    const controller = new AbortController();
    controller.abort();

    expect(() => helper.checkAbortSignal(controller.signal)).toThrow(
      'Operation aborted'
    );
  });

  it('should not throw when signal is not aborted', () => {
    const controller = new AbortController();

    expect(() => helper.checkAbortSignal(controller.signal)).not.toThrow();
  });
});

describe('ProviderHelper.wrapError', () => {
  const helper = new ProviderHelper();

  it('should return cancelled error when signal is aborted', () => {
    const controller = new AbortController();
    controller.abort();
    const originalError = new Error('Original error');

    const result = helper.wrapError(originalError, controller.signal);

    expect(result.type).toBe('error');
    expect(result.error?.message).toBe('Stream cancelled');
  });

  it('should return original error when signal is not aborted', () => {
    const controller = new AbortController();
    const originalError = new Error('Original error');

    const result = helper.wrapError(originalError, controller.signal);

    expect(result.type).toBe('error');
    expect(result.error).toBe(originalError);
  });
});
