import * as THREE from 'three';
import { Input } from '@tgdf';

import { BaseControls, BaseControlsOptions } from './BaseControls';

export type WSADControlsOptions = BaseControlsOptions;

export class WSADControls extends BaseControls {
  private _input: Input;

  private _isDragging: boolean = false;
  private _keyboardEnabled: boolean = true;
  private _mouseEnabled: boolean = true;

  constructor({ gameObject, camera, cameraLerp }: WSADControlsOptions) {
    super({ gameObject, camera, cameraLerp });

    // Get the global Input singleton
    this._input = Input.getInstance();

    this._handleKeyboardInput();
    this._handleMouseInput();
  }

  public toggleKeyboardInput(enabled: boolean) {
    this._keyboardEnabled = enabled;
  }

  public toggleMouseInput(enabled: boolean) {
    this._mouseEnabled = enabled;
  }

  private _handleKeyboardInput(): void {
    const keyMappings = [
      { key: 'w', axis: 'z' as const, value: -1 },
      { key: 'a', axis: 'x' as const, value: -1 },
      { key: 's', axis: 'z' as const, value: 1 },
      { key: 'd', axis: 'x' as const, value: 1 },
    ];

    // Attack
    this._input.addKeyDownListener('arrowup', () => {
      if (!this._keyboardEnabled) return;
      this.gameObject.attack('1');
    });

    // Sprint
    this._input.addKeyDownListener('shift', () => {
      if (!this._keyboardEnabled) return;
      this.gameObject.toggleSprint(true);
    });

    this._input.addKeyUpListener('shift', () => {
      this.gameObject.toggleSprint(false);
    });

    for (const { key, axis, value } of keyMappings) {
      this._input.addKeyPressListener(
        key,
        () => {
          if (!this._keyboardEnabled) return;
          this.direction[axis] = value;
        },
        10
      );
      this._input.addKeyUpListener(key, () => {
        this.direction[axis] = 0;
      });
    }
  }

  private _handleMouseInput(): void {
    this._input.addMouseClickListener('left', () => {
      if (!this._mouseEnabled) return;
      document.body.style.cursor = 'grabbing';
      this._isDragging = true;
    });

    this._input.addMouseUpListener('left', () => {
      document.body.style.cursor = 'grab';
      this._isDragging = false;
    });

    this._input.addMouseScrollListener((e: WheelEvent) => {
      if (!this._mouseEnabled) return;
      this.camera.setZoom(this.camera.zoom + e.deltaY * -BaseControls.ZOOM_SENSITIVITY);
    });

    this._input.addMouseMoveListener((e: MouseEvent) => {
      if (!this._mouseEnabled) return;
      if (this._isDragging) {
        const movementX = e.movementX || 0;
        // Rotate around pivot point
        const angle = -movementX * BaseControls.ROTATION_SENSITIVITY;
        // Get vector from pivot to camera
        const offset = new THREE.Vector3().subVectors(this.camera.position, this.camera.pivotPoint);
        // Rotate offset around Y axis
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        // Set new camera position
        this.camera.position.copy(this.camera.pivotPoint).add(offset);
        // Update camera rotation to match
        this.camera.rotation.y += angle;
      }
    });
  }

  protected override onDestroyed(): void {
    super.onDestroyed();
    document.body.style.cursor = 'default';
  }
}
