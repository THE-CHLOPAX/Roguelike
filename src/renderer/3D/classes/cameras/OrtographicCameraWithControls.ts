import * as THREE from 'three';
import { clamp, KeyboardInput, MouseInput, Scene } from '@tgdf';

import { OrtographicCamera, OrtographicCameraOptions } from './OrtographicCamera';

export type OrtographicCameraWithControlsOptions = OrtographicCameraOptions & {
  scene: Scene;
  speed?: number;
  lerp?: number;
  zoom?: {
    min: number;
    max: number;
    speed: number;
  };
};

/**
 * Ortographic Camera with keyboard and mouse controls.
 * Extends OrtographicCamera.
 * @param {OrtographicCameraWithControlsOptions} options - The options for the camera with controls.
 * @param {Scene} scene - The scene the camera belongs to.
 */
export class OrtographicCameraWithControls extends OrtographicCamera {
  private _zoom: { min: number; max: number; speed: number };
  private _speed: number;
  private _lerp: number;

  private _keyboardInput: KeyboardInput;
  private _mouseInput: MouseInput;

  private _isDragging: boolean = false;
  private _keyboardDisabled: boolean = false;

  private _movementTarget: THREE.Vector3 | null = null;

  constructor({
    options = {},
    zoom = { min: 0.1, max: 1, speed: 0.001 },
    speed = 0.1,
    lerp = 0.025,
    scene,
  }: OrtographicCameraWithControlsOptions) {
    super({ options });

    if (!scene.keyboardInput || !scene.mouseInput) {
      throw new Error('Camera requires keyboardInput and mouseInput dependencies.');
    }

    this._keyboardInput = scene.keyboardInput;
    this._mouseInput = scene.mouseInput;

    // Set initial zoom
    this._zoom = zoom;
    this.zoom = clamp(this.zoom, this._zoom.min, this._zoom.max);
    this.updateProjectionMatrix();

    this._speed = speed;
    this._lerp = lerp;

    // Update movement target each frame
    scene.events.on('update', this._updateMovement.bind(this));

    this._handleKeyboardInput();
    this._handleMouseInput();
  }

  public toggleKeyboardControls(enabled: boolean): void {
    this._keyboardDisabled = !enabled;
  }

  private _updateMovement(): void {
    if (!this._movementTarget) return;

    const threshold = 0.01;
    const distance = this.position.distanceTo(this._movementTarget);

    if (distance < threshold) {
      this.position.copy(this._movementTarget);
      this._movementTarget = null;
      return;
    }

    this.moveTo(this._movementTarget, { lerp: this._lerp });
  }

  private _handleKeyboardInput(): void {
    const keyMappings = [
      { key: 'w', axis: 'z' as const, value: -this._speed },
      { key: 'a', axis: 'x' as const, value: -this._speed },
      { key: 's', axis: 'z' as const, value: this._speed },
      { key: 'd', axis: 'x' as const, value: this._speed },
    ];

    for (const { key, axis, value } of keyMappings) {
      this._keyboardInput.addKeyPressListener(key, () => {
        if (this._keyboardDisabled) return;

        const movementVector = new THREE.Vector3(
          axis === 'x' ? value : 0,
          0,
          axis === 'z' ? value : 0
        );

        const yRotation = new THREE.Euler(0, this.rotation.y, 0, 'XYZ');
        const movementRotated = movementVector.applyEuler(yRotation);

        // Initialize or update the movement target
        if (!this._movementTarget) {
          this._movementTarget = new THREE.Vector3().copy(this.position);
        }
        this._movementTarget.add(movementRotated);
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
      this.zoom += e.deltaY * -this._zoom.speed;
      this.zoom = clamp(this.zoom, this._zoom.min, this._zoom.max);
      this.updateProjectionMatrix();
    });

    this._mouseInput.addMouseMoveListener((e: MouseEvent) => {
      if (this._isDragging) {
        const movementX = e.movementX || 0;
        //const movementY = e.movementY || 0;

        // Rotate around pivot point
        const angle = -movementX * 0.002;

        // Get vector from pivot to camera
        const offset = new THREE.Vector3().subVectors(this.position, this.pivotPoint);

        // Rotate offset around Y axis
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);

        // Set new camera position
        this.position.copy(this.pivotPoint).add(offset);

        // Update camera rotation to match
        this.rotation.y += angle;
      }
    });
  }
}
