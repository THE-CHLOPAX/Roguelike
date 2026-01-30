import { compareFloats } from './compareFloats';

export function filterBelow(a: number, b: number): number {
  return compareFloats(Math.abs(a), 'less-than', b) ? 0 : a;
}
