import { create } from 'zustand';
import { ipc, Resolution } from '@tgdf';

export const AVAILABLE_RESOLUTIONS: Resolution[] = [
  { width: 1920, height: 1080 },
  { width: 1280, height: 720 },
  { width: 640, height: 480 },
];

export type ThreeStepValueLevel = 'low' | 'medium' | 'high';

export type GraphicsState = {
  antialiasing: boolean;
  resolution: Resolution;
  fullscreen: boolean;
  shadowQuality: ThreeStepValueLevel;
  setShadowQuality: (quality: ThreeStepValueLevel) => void;
  setAntialiasing: (antialiasing: boolean) => void;
  setResolution: (resolution: Resolution) => void;
  setFullscreen: (fullscreen: boolean) => void;
}

// Find closest available resolution to current window size
async function getInitialResolution(): Promise<Resolution> {
  const currentWidth = window.outerWidth;
  const currentHeight = window.outerHeight;

  // Find the closest match from available resolutions
  let closest = AVAILABLE_RESOLUTIONS[0];
  let minDiff = Math.abs(currentWidth - closest.width) + Math.abs(currentHeight - closest.height);

  for (const res of AVAILABLE_RESOLUTIONS) {
    const diff = Math.abs(currentWidth - res.width) + Math.abs(currentHeight - res.height);
    if (diff < minDiff) {
      minDiff = diff;
      closest = res;
    }
  }

  return closest;
}

// Initial fullscreen state fetch from main process
async function getInitialFullscreenState(): Promise<boolean> {
  return new Promise((resolve) => {
    ipc.send('get-fullscreen-state-request', undefined);
    ipc.once('get-fullscreen-state-response', (response) => {
      resolve(response.fullscreen);
    });
  });
}

export const useGraphicsStore = create<GraphicsState>((set) => ({
  antialiasing: false,
  resolution: AVAILABLE_RESOLUTIONS[1],
  fullscreen: false,
  shadowQuality: 'medium',
  setShadowQuality: (shadowQuality) => set({ shadowQuality }),
  setAntialiasing: (antialiasing) => set({ antialiasing }),
  setResolution: (resolution) => {
    ipc.send('set-resolution-request', { resolution });
    ipc.once('set-resolution-response', (response) => {
      set({ resolution: response.resolution });
    });
  },
  setFullscreen: (fullscreen) => {
    ipc.send('set-fullscreen-request', { fullscreen, resolution: useGraphicsStore.getState().resolution });
    ipc.once('set-fullscreen-response', (response) => {
      set({ fullscreen: response.fullscreen });
    });
  },
}));

// Initialize resolution and fullscreen state on store creation
Promise.all([
  getInitialResolution(),
  getInitialFullscreenState()
]).then(([resolution, fullscreen]) => {
  useGraphicsStore.getState().setFullscreen(fullscreen);
  useGraphicsStore.getState().setResolution(resolution);
});