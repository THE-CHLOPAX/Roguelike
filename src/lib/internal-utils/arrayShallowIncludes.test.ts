import { describe, it, expect } from 'vitest';

import { arrayShallowIncludes } from './arrayShallowIncludes';

describe('arrayShallowIncludes', () => {
  describe('primitive values', () => {
    it('returns true when the array contains the value', () => {
      expect(arrayShallowIncludes([1, 2, 3], 2)).toBe(true);
      expect(arrayShallowIncludes(['a', 'b'], 'b')).toBe(true);
    });

    it('returns false when the array does not contain the value', () => {
      expect(arrayShallowIncludes([1, 2, 3], 4)).toBe(false);
      expect(arrayShallowIncludes([], 1)).toBe(false);
    });

    it('handles null values without throwing', () => {
      expect(arrayShallowIncludes([null, 1], null)).toBe(true);
      expect(arrayShallowIncludes([1, 2], null)).toBe(false);
    });
  });

  describe('object values', () => {
    it('returns true for an object reference already in the array', () => {
      const object = { a: 1 };

      expect(arrayShallowIncludes([object], object)).toBe(true);
    });

    it('returns true for a different object with shallow-equal keys/values', () => {
      expect(arrayShallowIncludes([{ a: 1, b: 2 }], { a: 1, b: 2 })).toBe(true);
    });

    it('returns false when no element is shallow-equal to the value', () => {
      expect(arrayShallowIncludes([{ a: 1 }], { a: 2 })).toBe(false);
      expect(arrayShallowIncludes([{ a: 1 }], { a: 1, b: 2 })).toBe(false);
    });

    it('does not match nested objects that differ by reference', () => {
      expect(arrayShallowIncludes([{ nested: { value: 1 } }], { nested: { value: 1 } })).toBe(
        false
      );
    });
  });
});
