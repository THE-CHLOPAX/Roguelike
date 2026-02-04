import { KeyboardInput, MouseInput } from '@tgdf';

import {
  InertialPerspectiveCamera,
  InertialPerspectiveCameraOptions,
} from './InertialPerspectiveCamera';

export type InertialPerspectiveCameraWithControlsOptions = InertialPerspectiveCameraOptions & {};

const AFTER_ZOOM_TIMEOUT_MS = 300;
const ZOOM_VALUE = 1;

/**
 * Inertial Perspective Camera with keyboard and mouse controls.
 * Extends InertialPerspectiveCamera.
 * @param {InertialPerspectiveCameraWithControlsOptions} options - The options for the camera with controls.
 * @param {CameraInertiaOptions} inertiaOptions - The inertia options for the camera.
 * @param {Scene} scene - The scene the camera belongs to.
 */
export class InertialPerspectiveCameraWithControls extends InertialPerspectiveCamera {
  private _keyboardInput: KeyboardInput;
  private _mouseInput: MouseInput;

  private _isDragging: boolean = false;

  private _zoomTimeout: NodeJS.Timeout | null = null;

  constructor({
    options = {},
    inertiaOptions = {},
    scene,
  }: InertialPerspectiveCameraWithControlsOptions) {
    super({ options, inertiaOptions, scene });

    if (!scene.keyboardInput || !scene.mouseInput) {
      throw new Error('Camera requires keyboardInput and mouseInput dependencies.');
    }

    this._keyboardInput = scene.keyboardInput;
    this._mouseInput = scene.mouseInput;

    this._handleKeyboardInput();
    this._handleMouseInput();
  }

  private _handleKeyboardInput(): void {
    const keyMappings = [
      { key: 'w', axis: 'z' as const, value: -1 },
      { key: 'a', axis: 'x' as const, value: -1 },
      { key: 's', axis: 'z' as const, value: 1 },
      { key: 'd', axis: 'x' as const, value: 1 },
      { key: 'Space', axis: 'y' as const, value: 1 },
      { key: 'c', axis: 'y' as const, value: -1 },
    ];

    for (const { key, axis, value } of keyMappings) {
      this._keyboardInput.addKeyPressListener(key, () => {
        this.direction[axis] = value;
      });
      this._keyboardInput.addKeyUpListener(key, () => {
        this.direction[axis] = 0;
      });
    }
  }

  private _handleMouseInput(): void {
    this._mouseInput.addMouseClickListener('left', () => {
      document.body.style.cursor = 'grabbing';
      this._isDragging = true;
    });

    this._mouseInput.addMouseUpListener('left', () => {
      document.body.style.cursor = 'grab';
      this._isDragging = false;
    });

    this._mouseInput.addMouseScrollListener((e: WheelEvent) => {
      const delta = Math.sign(e.deltaY);
      this.direction.z = delta * ZOOM_VALUE;

      if (this._zoomTimeout) {
        clearTimeout(this._zoomTimeout);
      }

      this._zoomTimeout = setTimeout(() => {
        this.direction.z = 0;
        this._zoomTimeout = null;
      }, AFTER_ZOOM_TIMEOUT_MS);
    });

    this._mouseInput.addMouseMoveListener((e: MouseEvent) => {
      if (this._isDragging) {
        const movementX = e.movementX || 0;
        const movementY = e.movementY || 0;

        this.rotation.y -= movementX * 0.002;
        this.rotation.x -= movementY * 0.002;

        // Clamp the vertical rotation to prevent flipping
        this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
      }
    });
  }
}
