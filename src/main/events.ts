import { Resolution } from '@tgdf/internal-ui/types/graphics';

import { mainWindow, main } from './main';
import { getZoomFactorForResolution } from './utils/getZoomFactorForResolution';

const currentResolution: Resolution = { width: 1280, height: 720 };

export function bindUserEvents(): void {
  main.on('app-quit-request', onCloseAppRequest);
  main.on('set-resolution-request', onResolutionRequest);
  main.on('set-fullscreen-request', onFullscreenRequest);
  main.on('get-fullscreen-state-request', onGetFullscreenStateRequest);

  if (!mainWindow) {
    return;
  }

  mainWindow.on('enter-full-screen', onEnterFullscreen);
  mainWindow.on('leave-full-screen', onLeaveFullscreen);
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

  currentResolution.width = resolution.width;
  currentResolution.height = resolution.height;

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

export function onFullscreenRequest(request: {
  resolution: Resolution;
  fullscreen: boolean;
}): void {
  if (!mainWindow) {
    return;
  }

  const { fullscreen, resolution } = request;

  currentResolution.width = resolution.width;
  currentResolution.height = resolution.height;

  mainWindow.setFullScreen(fullscreen);
}

export function onEnterFullscreen() {
  if (!mainWindow) {
    return;
  }

  const zoomFactor = getZoomFactorForResolution(currentResolution, mainWindow, true);
  mainWindow.webContents.setZoomFactor(zoomFactor);

  main.send('set-fullscreen-response', { fullscreen: true });
}

export function onLeaveFullscreen() {
  mainWindow?.setContentSize(currentResolution.width, currentResolution.height);
  mainWindow?.webContents.setZoomFactor(1);
  main.send('set-fullscreen-response', { fullscreen: false });
}
