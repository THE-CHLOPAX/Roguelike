import { Resolution } from '@tgdf/internal-ui/types/graphics';

import { mainWindow, main } from './main';
import { getZoomFactorForResolution } from './utils/getZoomFactorForResolution';

export function bindUserEvents(): void {
  main.on('app-quit-request', onCloseAppRequest);
  main.on('set-resolution-request', onResolutionRequest);
  main.on('set-fullscreen-request', onFullscreenRequest);
  main.on('get-fullscreen-state-request', onGetFullscreenStateRequest);
}

export function onCloseAppRequest(): void {
  if (!mainWindow) {
    return;
  }
  mainWindow.close();
}

export function onResolutionRequest(request: { resolution: Resolution }): void {
  if (!mainWindow) {
    return;
  }

  const { resolution } = request;
  const fullscreen = mainWindow.isFullScreen();

  let zoomFactor = 1;

  // If fullscreen, set resolution by manipulating zoom level
  if (fullscreen) {
    zoomFactor = getZoomFactorForResolution(resolution, mainWindow, true);
  } else {
    mainWindow.setContentSize(resolution.width, resolution.height);
  }

  mainWindow.setFullScreen(fullscreen);
  mainWindow.webContents.setZoomFactor(zoomFactor);

  main.send('set-resolution-response', { resolution });
}


export function onGetFullscreenStateRequest(): void {
  if (!mainWindow) {
    return;
  }

  const fullscreen = mainWindow.isFullScreen();
  main.send('get-fullscreen-state-response', { fullscreen });
}


export function onFullscreenRequest(request: { resolution: Resolution; fullscreen: boolean }): void {
  if (!mainWindow) {
    return;
  }

  const { fullscreen, resolution } = request;
  const isCurrentlyFullscreen = mainWindow.isFullScreen();

  if (isCurrentlyFullscreen && !fullscreen) {
    mainWindow.once('leave-full-screen', () => {
      mainWindow?.setContentSize(resolution.width, resolution.height);
      mainWindow?.webContents.setZoomFactor(1);
    });
  } else if (!isCurrentlyFullscreen && fullscreen) {
    const zoomFactor = getZoomFactorForResolution(resolution, mainWindow, true);
    mainWindow.webContents.setZoomFactor(zoomFactor);
  }

  mainWindow.setFullScreen(fullscreen);

  if (fullscreen) {
    mainWindow.once('enter-full-screen', () => {
      main.send('set-fullscreen-response', { fullscreen });
    });
  } else {
    mainWindow.once('leave-full-screen', () => {
      main.send('set-fullscreen-response', { fullscreen });
    });
  }

}