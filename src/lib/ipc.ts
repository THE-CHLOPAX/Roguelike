import { ipcRenderer } from 'electron';
import { NativeEventMainMap, NativeEventRendererMap } from '@tgdf';

/**
 * Typed IPC renderer helper for sending events to main process
 */
export const ipc = {
  /**
   * Send an event to the main process
   */
  send: <T extends keyof NativeEventRendererMap>(
    channel: T,
    data: NativeEventRendererMap[T]
  ) => {
    ipcRenderer.send(channel, data);
  },

  /**
   * Listen for events from the main process
   */
  on: <T extends keyof NativeEventMainMap>(
    channel: T,
    func: (data: NativeEventMainMap[T]) => void
  ) => {
    const listener = (_: Electron.IpcRendererEvent, data: NativeEventMainMap[T]) => func(data);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },

  /**
   * Listen for events from the main process (once)
   */
  once: <T extends keyof NativeEventMainMap>(
    channel: T,
    func: (data: NativeEventMainMap[T]) => void
  ) => {
    ipcRenderer.once(channel, (_, data: NativeEventMainMap[T]) => func(data));
  },

  /**
   * Remove all listeners for a channel
   */
  removeAllListeners: <T extends keyof NativeEventMainMap>(channel: T) => {
    ipcRenderer.removeAllListeners(channel);
  },
};
