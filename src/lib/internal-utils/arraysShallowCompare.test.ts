import { describe, it, expect } from 'vitest';

import { arraysShallowCompare } from './arraysShallowCompare';

describe('arraysShallowCompare', () => {
  it('returns true for the same array reference', () => {
    const array = [1, 2, 3];

    expect(arraysShallowCompare(array, array)).toBe(true);
  });

  it('returns true for arrays with the same elements in the same order', () => {
    expect(arraysShallowCompare([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(arraysShallowCompare(['a', 'b'], ['a', 'b'])).toBe(true);
    expect(arraysShallowCompare([], [])).toBe(true);
  });

  it('returns false for arrays with different lengths', () => {
    expect(arraysShallowCompare([1, 2], [1, 2, 3])).toBe(false);
    expect(arraysShallowCompare([1], [])).toBe(false);
  });

  it('returns false for the same elements in a different order', () => {
    expect(arraysShallowCompare([1, 2, 3], [3, 2, 1])).toBe(false);
  });

  it('compares elements by reference, not deeply', () => {
    const object = { value: 1 };

    expect(arraysShallowCompare([object], [object])).toBe(true);
    expect(arraysShallowCompare([{ value: 1 }], [{ value: 1 }])).toBe(false);
  });
});
