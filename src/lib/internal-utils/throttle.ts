export function throttle<Args extends unknown[]>(
  callback: (...args: Args) => void,
  intervalMs: number
): (...args: Args) => void {
  let lastCallTime = -Infinity;

  return (...args: Args) => {
    const now = Date.now();
    if (now - lastCallTime < intervalMs) return;

    lastCallTime = now;
    callback(...args);
  };
}
