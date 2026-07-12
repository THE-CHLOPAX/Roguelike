export function throttleWithLastValue<Args extends unknown[], Return>(
  callback: (...args: Args) => Return,
  intervalMs: number,
  initialValue: Return
): (...args: Args) => Return {
  let lastCallTime = -Infinity;
  let lastResult = initialValue;

  return (...args: Args) => {
    const now = Date.now();
    if (now - lastCallTime >= intervalMs) {
      lastCallTime = now;
      lastResult = callback(...args);
    }

    return lastResult;
  };
}
