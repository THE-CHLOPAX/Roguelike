import { describe, it, expect } from 'vitest';

import { objectShallowEqual } from './objectShallowEqual';

describe('objectShallowEqual', () => {
  it('returns true for the same object reference', () => {
    const object = { a: 1 };

    expect(objectShallowEqual(object, object)).toBe(true);
  });

  it('returns true for objects with the same keys and values', () => {
    expect(objectShallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    expect(objectShallowEqual({}, {})).toBe(true);
  });

  it('returns false for objects with a different number of keys', () => {
    expect(objectShallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(objectShallowEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
  });

  it('returns false when a key has a different value', () => {
    expect(objectShallowEqual({ a: 1 }, { a: 2 })).toBe(false);
  });

  it('returns false when the same number of keys point to different keys', () => {
    expect(objectShallowEqual({ a: 1 }, { b: 1 })).toBe(false);
  });

  it('compares values by reference, not deeply', () => {
    const nested = { value: 1 };

    expect(objectShallowEqual({ nested }, { nested })).toBe(true);
    expect(objectShallowEqual({ nested: { value: 1 } }, { nested: { value: 1 } })).toBe(false);
  });
});
