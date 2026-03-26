export const executeAsyncOperationsWithProgress = <T extends readonly unknown[]>(
  promises: { [K in keyof T]: Promise<T[K]> },
  onProgress: (progress: number) => void
): Promise<T> => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const total = promises.length;
    let loaded = 0;

    for (const promise of promises) {
      try {
        await promise;
        loaded += 1;
        onProgress(loaded / total);
      } catch (error) {
        reject(error);
      }
    }

    resolve(await Promise.all(promises));
  });
};
