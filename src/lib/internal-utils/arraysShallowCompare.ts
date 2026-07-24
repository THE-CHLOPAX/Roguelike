export function arraysShallowCompare<T>(a: readonly T[], b: readonly T[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  return a.every((element, index) => element === b[index]);
}
