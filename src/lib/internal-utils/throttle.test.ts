import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { throttle } from './throttle';

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls the callback on the first invocation', () => {
    const callback = vi.fn();
    const throttled = throttle(callback, 100);

    throttled();

    expect(callback).toHaveBeenCalledOnce();
  });

  it('ignores calls made before the interval has elapsed', () => {
    const callback = vi.fn();
    const throttled = throttle(callback, 100);

    throttled();
    vi.advanceTimersByTime(50);
    throttled();
    throttled();

    expect(callback).toHaveBeenCalledOnce();
  });

  it('calls the callback again once the interval has elapsed', () => {
    const callback = vi.fn();
    const throttled = throttle(callback, 100);

    throttled();
    vi.advanceTimersByTime(100);
    throttled();

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('forwards arguments to the callback', () => {
    const callback = vi.fn();
    const throttled = throttle(callback, 100);

    throttled('a', 1);

    expect(callback).toHaveBeenCalledWith('a', 1);
  });
});
