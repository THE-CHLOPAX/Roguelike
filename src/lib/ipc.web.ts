import { NativeEventMainMap, NativeEventRendererMap } from '@tgdf';

/**
 * Web-compatible IPC module (no-op for browser builds)
 * This is a mock implementation that does nothing but prevents errors
 */
export const ipc = {
  /**
   * Send an event to the main process (no-op in web)
   */
  send: <T extends keyof NativeEventRendererMap>(
    channel: T,
    data: NativeEventRendererMap[T]
  ) => {
    console.warn(`IPC send called in web mode: ${String(channel)}`, data);
  },

  /**
   * Listen for events from the main process (no-op in web)
   */
  on: <T extends keyof NativeEventMainMap>(
    channel: T,
    func: (data: NativeEventMainMap[T]) => void
  ) => {
    console.warn(`IPC on called in web mode: ${String(channel)}`);
    return () => {}; // Return a no-op cleanup function
  },

  /**
   * Listen for events from the main process (once) (no-op in web)
   */
  once: <T extends keyof NativeEventMainMap>(
    channel: T,
    func: (data: NativeEventMainMap[T]) => void
  ) => {
    console.warn(`IPC once called in web mode: ${String(channel)}`);
  },

  /**
   * Remove all listeners for a channel (no-op in web)
   */
  removeAllListeners: <T extends keyof NativeEventMainMap>(channel: T) => {
    console.warn(`IPC removeAllListeners called in web mode: ${String(channel)}`);
  },
};
