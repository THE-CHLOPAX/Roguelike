import { BrowserWindow, screen } from 'electron';
import { Resolution } from '@tgdf/internal-ui/types/graphics';

export function getZoomFactorForResolution(
  resolution: Resolution,
  mainWindow: BrowserWindow,
  relativeToMonitor: boolean = false,
): number {
  if (!mainWindow) {
    console.error('Main window is not initialized.');
    return 1.0; // Default zoom factor
  }
  let height = mainWindow.getSize()[1];

  if (relativeToMonitor) {
    const { height: monitorHeight } = screen.getPrimaryDisplay().workAreaSize;
    height = monitorHeight;
  }

  return height / resolution.height;
}