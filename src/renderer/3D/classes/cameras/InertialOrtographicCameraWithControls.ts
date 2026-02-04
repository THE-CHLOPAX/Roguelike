import { clamp, KeyboardInput, MouseInput } from '@tgdf';

import {
  InertialOrtographicCamera,
  InertialOrtographicCameraOptions,
} from './InertialOrtographicCamera';

export type InertialOrtographicCameraWithControlsOptions = InertialOrtographicCameraOptions & {
  zoom?: {
    min: number;
    max: number;
  };
};

const ZOOM_SPEED = 0.001;

/**
 * Inertial Ortographic Camera with keyboard and mouse controls.
 * Extends InertialOrtographicCamera.
 * @param {InertialOrtographicCameraWithControlsOptions} options - The options for the camera with controls.
 * @param {CameraInertiaOptions} inertiaOptions - The inertia options for the camera.
 * @param {Scene} scene - The scene the camera belongs to.
 */
export class InertialOrtographicCameraWithControls extends InertialOrtographicCamera {
  private _zoomLimits: { min: number; max: number } = { min: 0.1, max: 1 };

  private _keyboardInput: KeyboardInput;
  private _mouseInput: MouseInput;

  private _isDragging: boolean = false;

  constructor({
    options = {},
    zoom = { min: 0.1, max: 1 },
    inertiaOptions = {},
    scene,
  }: InertialOrtographicCameraWithControlsOptions) {
    super({ options, inertiaOptions, scene });

    if (!scene.keyboardInput || !scene.mouseInput) {
      throw new Error('Camera requires keyboardInput and mouseInput dependencies.');
    }

    this._keyboardInput = scene.keyboardInput;
    this._mouseInput = scene.mouseInput;

    this._handleKeyboardInput();
    this._handleMouseInput();

    // Set initial zoom
    this._zoomLimits = zoom;
    this.zoom = clamp(this.zoom, this._zoomLimits.min, this._zoomLimits.max);
    this.updateProjectionMatrix();
  }

  private _handleKeyboardInput(): void {
    const keyMappings = [
      { key: 'w', axis: 'z' as const, value: -1 },
      { key: 'a', axis: 'x' as const, value: -1 },
      { key: 's', axis: 'z' as const, value: 1 },
      { key: 'd', axis: 'x' as const, value: 1 },
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
      this.zoom += e.deltaY * -ZOOM_SPEED;
      this.zoom = clamp(this.zoom, this._zoomLimits.min, this._zoomLimits.max);
      this.updateProjectionMatrix();
    });

    this._mouseInput.addMouseMoveListener((e: MouseEvent) => {
      if (this._isDragging) {
        const movementX = e.movementX || 0;
        //const movementY = e.movementY || 0;

        this.rotation.y -= movementX * 0.002;
        //this.rotation.x -= movementY * 0.002;

        // Disabling X rotation for the isometric camera effect.

        // Clamp the vertical rotation to prevent flipping
        //this.rotation.x = clamp(this.rotation.x, -Math.PI / 2, Math.PI / 2);
      }
    });
  }
}
