// tests/unit/providers/llm/utils/signal-utils.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { SignalUtils } from '../../../../../src/providers/llm/utils/signal-utils.js';

describe('SignalUtils.neverAbort', () => {
  it('should create a signal that never aborts', () => {
    const signal = SignalUtils.neverAbort();

    expect(signal.aborted).toBe(false);

    // Even after a long time, it should not abort
    vi.useFakeTimers();
    vi.advanceTimersByTime(1000000);
    expect(signal.aborted).toBe(false);
    vi.restoreAllMocks();
  });
});

describe('SignalUtils.timeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a signal that aborts after timeout', () => {
    const signal = SignalUtils.timeout(1000);

    expect(signal.aborted).toBe(false);

    vi.advanceTimersByTime(999);
    expect(signal.aborted).toBe(false);

    vi.advanceTimersByTime(1);
    expect(signal.aborted).toBe(true);
  });
});

describe('SignalUtils.timeoutWithController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return both signal and controller', () => {
    const result = SignalUtils.timeoutWithController(1000);

    expect(result.signal).toBeInstanceOf(AbortSignal);
    expect(result.controller).toBeInstanceOf(AbortController);
  });

  it('should allow manual abort before timeout', () => {
    const { signal, controller } = SignalUtils.timeoutWithController(1000);

    expect(signal.aborted).toBe(false);

    controller.abort();
    expect(signal.aborted).toBe(true);
  });
});

describe('SignalUtils.merge', () => {
  it('should abort when any signal aborts', () => {
    const controller1 = new AbortController();
    const controller2 = new AbortController();

    const merged = SignalUtils.merge(controller1.signal, controller2.signal);

    expect(merged.aborted).toBe(false);

    controller1.abort();
    expect(merged.aborted).toBe(true);
  });

  it('should return aborted signal if any input is already aborted', () => {
    const controller1 = new AbortController();
    const controller2 = new AbortController();
    controller2.abort();

    const merged = SignalUtils.merge(controller1.signal, controller2.signal);

    expect(merged.aborted).toBe(true);
  });
});

describe('SignalUtils.tokenLimit', () => {
  it('should abort after reaching token limit', () => {
    const { signal, increment } = SignalUtils.tokenLimit(3);

    expect(signal.aborted).toBe(false);

    increment();
    expect(signal.aborted).toBe(false);

    increment();
    expect(signal.aborted).toBe(false);

    increment();
    expect(signal.aborted).toBe(true);
  });
});
