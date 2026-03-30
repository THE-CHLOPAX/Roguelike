export const executeAsyncOperationsWithProgress = <T extends readonly unknown[]>(
  promises: { [K in keyof T]: Promise<T[K]> },
  onProgress: (progress: number) => void
): Promise<T> => {
  const total = promises.length;
  if (total === 0) {
    onProgress(1);
    return Promise.resolve([] as unknown as T);
  }

  let loaded = 0;
  onProgress(0);

  const wrappedPromises = promises.map((p) =>
    p.then((result) => {
      loaded++;
      onProgress(loaded / total);
      return result;
    })
  ) as { [K in keyof T]: Promise<T[K]> };

  return Promise.all(wrappedPromises);
};
