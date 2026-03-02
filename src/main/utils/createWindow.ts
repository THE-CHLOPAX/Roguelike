import * as path from 'path';
import { BrowserWindow } from 'electron';
import * as isDev from 'electron-is-dev';

import { overrideMacMenu } from './overrideMacMenu';

export function createWindow(): BrowserWindow {
  // Create the browser window
  const mainWindow = new BrowserWindow({
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

  // Override default macOS top menu
  overrideMacMenu();

  // Override windows menu
  if (process.platform === 'win32') {
    mainWindow.setMenu(null);
  }

  return mainWindow;
}
