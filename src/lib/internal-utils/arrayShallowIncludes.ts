import { objectShallowEqual } from './objectShallowEqual';

export function arrayShallowIncludes<T>(array: Array<T>, value: T): boolean {
  switch (typeof value) {
    case 'object': {
      if (value === null) return array.includes(value);

      return array.some(
        (element) =>
          typeof element === 'object' &&
          element !== null &&
          objectShallowEqual(
            element as Record<string, unknown>,
            value as Record<string, unknown>
          )
      );
    }
    default:
      return array.includes(value);
  }
}
