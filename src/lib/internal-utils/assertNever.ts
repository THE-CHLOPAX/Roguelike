/**
 * Exhaustiveness check for switch/if-else chains over a union. Call it in
 * the `default`/final branch: if every member of the union is handled, `x`'s
 * narrowed type there is `never` and this compiles; if a new member is added
 * without a corresponding branch, `x` still includes it and TypeScript
 * rejects the call — turning a silently-skipped case into a build error.
 */
export function assertNever(x: never, message?: string): never {
  throw new Error(message ?? `Unhandled case: ${JSON.stringify(x)}`);
}
