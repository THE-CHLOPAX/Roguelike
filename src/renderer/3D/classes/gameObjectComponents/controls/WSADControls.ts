import * as THREE from 'three';
import { KeyboardInput, logger, MouseInput } from '@tgdf';

import { BaseControls, BaseControlsOptions } from './BaseControls';

export type WSADControlsOptions = BaseControlsOptions & {
  mouseInput?: MouseInput;
  keyboardInput?: KeyboardInput;
};

export class WSADControls extends BaseControls {
  private _keyboardInput: KeyboardInput;
  private _mouseInput: MouseInput;

  private _isDragging: boolean = false;
  private _keyboardEnabled: boolean = true;
  private _mouseEnabled: boolean = true;

  constructor({ gameObject, camera, keyboardInput, mouseInput, cameraLerp }: WSADControlsOptions) {
    super({ gameObject, camera, cameraLerp });

    this._keyboardInput = keyboardInput!;
    this._mouseInput = mouseInput!;

    if (!keyboardInput || !mouseInput) {
      logger({
        message:
          'Mouse or keyboard input not provided. WSADControls component requires both to function.',
        type: 'error',
      });
      throw new Error('Mouse or keyboard input not provided for WSADControls');
    }

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
    this._keyboardInput.addKeyDownListener('arrowup', () => {
      if (!this._keyboardEnabled) return;
      this.gameObject.attack('1');
    });

    // Sprint
    this._keyboardInput.addKeyDownListener('shift', () => {
      if (!this._keyboardEnabled) return;
      this.gameObject.toggleSprint(true);
    });

    this._keyboardInput.addKeyUpListener('shift', () => {
      this.gameObject.toggleSprint(false);
    });

    for (const { key, axis, value } of keyMappings) {
      this._keyboardInput.addKeyPressListener(
        key,
        () => {
          if (!this._keyboardEnabled) return;
          this.direction[axis] = value;
        },
        10
      );
      this._keyboardInput.addKeyUpListener(key, () => {
        this.direction[axis] = 0;
      });
    }
  }

  private _handleMouseInput(): void {
    this._mouseInput.addMouseClickListener('left', () => {
      if (!this._mouseEnabled) return;
      document.body.style.cursor = 'grabbing';
      this._isDragging = true;
    });

    this._mouseInput.addMouseUpListener('left', () => {
      document.body.style.cursor = 'grab';
      this._isDragging = false;
    });

    this._mouseInput.addMouseScrollListener((e: WheelEvent) => {
      if (!this._mouseEnabled) return;
      this.camera.setZoom(this.camera.zoom + e.deltaY * -BaseControls.ZOOM_SENSITIVITY);
    });

    this._mouseInput.addMouseMoveListener((e: MouseEvent) => {
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
