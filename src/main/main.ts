import * as path from 'path';
import * as isDev from 'electron-is-dev';
import { app, BrowserWindow, ipcMain } from 'electron';
import { NativeEventMainMap, NativeEventRendererMap } from '@tgdf/internal-ui/types/native';

import { bindUserEvents } from './events';

export let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  mainWindow?.webContents.on('dom-ready', () => {
    mainWindow?.webContents.setZoomFactor(1.0);
  });

  // Bind IPC event handlers
  bindUserEvents();

  app.on('activate', (): void => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed
app.on('window-all-closed', (): void => {
  app.quit();
});

export const main = {
  send: <T extends keyof NativeEventMainMap>(channel: T, data: NativeEventMainMap[T]) =>
    mainWindow?.webContents.send(channel, data ?? {}),
  on: <T extends keyof NativeEventRendererMap>(
    channel: T,
    func: (args: NativeEventRendererMap[T]) => void
  ) => ipcMain.on(channel, (_, ...args) => func(args[0])),
  once: <T extends keyof NativeEventRendererMap>(
    channel: T,
    func: (args: NativeEventRendererMap[T]) => void
  ) => ipcMain.once(channel, (_, ...args) => func(args[0])),
  off: <T extends keyof NativeEventRendererMap>(
    channel: T,
    func: (args: NativeEventRendererMap[T]) => void
  ) => ipcMain.off(channel, (_, ...args) => func(args[0])),
};
