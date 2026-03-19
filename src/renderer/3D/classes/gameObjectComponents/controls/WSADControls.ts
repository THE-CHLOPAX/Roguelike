import * as THREE from 'three';
import { KeyboardInput, MouseInput } from '@tgdf';

import { HUMANOID_STATES } from '../../../types';
import { StateController } from '../StateController';
import { BaseControls, BaseControlsOptions } from './BaseControls';

export type WSADControlsOptions = BaseControlsOptions & {
  mouseInput: MouseInput;
  keyboardInput: KeyboardInput;
  stateController: StateController<HUMANOID_STATES>;
};

export class WSADControls extends BaseControls {
  private _keyboardInput: KeyboardInput;
  private _mouseInput: MouseInput;
  private _stateController: StateController<HUMANOID_STATES>;

  private _isDragging: boolean = false;

  constructor({
    gameObject,
    camera,
    keyboardInput,
    mouseInput,
    cameraLerp,
    stateController,
  }: WSADControlsOptions) {
    super({ gameObject, camera, cameraLerp });

    this._keyboardInput = keyboardInput;
    this._mouseInput = mouseInput;
    this._stateController = stateController;

    this._handleKeyboardInput();
    this._handleMouseInput();
  }

  private _handleKeyboardInput(): void {
    const keyMappings = [
      { key: 'w', axis: 'z' as const, value: -1 },
      { key: 'a', axis: 'x' as const, value: -1 },
      { key: 's', axis: 'z' as const, value: 1 },
      { key: 'd', axis: 'x' as const, value: 1 },
    ];

    this._keyboardInput.addKeyDownListener('shift', () => {
      this.movableGameObject.toggleSprint(true);
    });

    this._keyboardInput.addKeyUpListener('shift', () => {
      this.movableGameObject.toggleSprint(false);
    });

    for (const { key, axis, value } of keyMappings) {
      this._keyboardInput.addKeyPressListener(
        key,
        () => {
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
      document.body.style.cursor = 'grabbing';
      this._isDragging = true;
    });

    this._mouseInput.addMouseUpListener('left', () => {
      document.body.style.cursor = 'grab';
      this._isDragging = false;
    });

    this._mouseInput.addMouseScrollListener((e: WheelEvent) => {
      this.camera.setZoom(this.camera.zoom + e.deltaY * -BaseControls.ZOOM_SENSITIVITY);
    });

    this._mouseInput.addMouseMoveListener((e: MouseEvent) => {
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
