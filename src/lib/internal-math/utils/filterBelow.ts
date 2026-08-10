import { compareFloats } from './compareFloats';

/**
 * Filters a number `a` and returns 0 if its absolute value is less than `b`, otherwise returns `a`.
 * @param a Value to be filtered.
 * @param b Threshold value.
 * @returns
 */
export function filterBelow(a: number, b: number): number {
  return compareFloats(Math.abs(a), '<', b) ? 0 : a;
}
