import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { throttleWithLastValue } from './throttleWithLastValue';

describe('throttleWithLastValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls the callback and returns its result on the first invocation', () => {
    const callback = vi.fn(() => 'first');
    const throttled = throttleWithLastValue(callback, 100, 'initial');

    expect(throttled()).toBe('first');
    expect(callback).toHaveBeenCalledOnce();
  });

  it('returns the cached result without calling the callback before the interval elapses', () => {
    const callback = vi.fn(() => 'first');
    const throttled = throttleWithLastValue(callback, 100, 'initial');

    throttled();
    callback.mockReturnValue('second');
    vi.advanceTimersByTime(50);

    expect(throttled()).toBe('first');
    expect(callback).toHaveBeenCalledOnce();
  });

  it('calls the callback again and returns the new result once the interval elapses', () => {
    const callback = vi.fn(() => 'first');
    const throttled = throttleWithLastValue(callback, 100, 'initial');

    throttled();
    callback.mockReturnValue('second');
    vi.advanceTimersByTime(100);

    expect(throttled()).toBe('second');
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('forwards arguments to the callback', () => {
    const callback = vi.fn((a: string, b: number) => `${a}-${b}`);
    const throttled = throttleWithLastValue(callback, 100, 'initial');

    expect(throttled('x', 1)).toBe('x-1');
    expect(callback).toHaveBeenCalledWith('x', 1);
  });
});
