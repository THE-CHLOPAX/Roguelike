import * as THREE from 'three';
import { GamepadInput } from '@tgdf';

import { BaseControls, BaseControlsOptions } from './BaseControls';

export type GamepadControlsOptions = BaseControlsOptions & {
  gamepadInput: GamepadInput;
};

const GAMEPAD_ZOOM_MULTIPLIER = 4;
const GAMEPAD_ROTATION_MULTIPLIER = 3;

export class GamepadControls extends BaseControls {
  private _gamepadInput: GamepadInput;
  private _rotationIncrement: number = 0;
  private _zoomIncrement: number = 0;

  constructor({ gameObject, camera, cameraLerp, gamepadInput }: GamepadControlsOptions) {
    super({ gameObject, camera, cameraLerp });

    this._gamepadInput = gamepadInput;

    this._handleGamepadInput();
  }

  private _handleGamepadInput(): void {
    this._gamepadInput.addAxisMoveListener('LEFT_STICK_X', this._handleLeftStickXMove);
    this._gamepadInput.addAxisMoveListener('LEFT_STICK_Y', this._handleLeftStickYMove);

    this._gamepadInput.addAxisMoveListener('RIGHT_STICK_Y', (value: number) => {
      this._zoomIncrement = value;
    });

    this._gamepadInput.addAxisMoveListener('RIGHT_STICK_X', (value: number) => {
      this._rotationIncrement = value;
    });

    this._gamepadInput.addButtonDownListener('RT', this._handleSprintButtonDown);
    this._gamepadInput.addButtonUpListener('RT', this._handleSprintButtonUp);
  }

  private _handleLeftStickXMove = (value: number): void => {
    this.direction.x = value;
  };

  private _handleLeftStickYMove = (value: number): void => {
    this.direction.z = value;
  };

  private _handleSprintButtonDown = (): void => {
    this.toggleSprint(true);
  };

  private _handleSprintButtonUp = (): void => {
    this.toggleSprint(false);
  };

  private _handleCameraMovement(): void {
    // Handle rotation
    const angle =
      this._rotationIncrement * BaseControls.ROTATION_SENSITIVITY * GAMEPAD_ROTATION_MULTIPLIER;
    const offset = new THREE.Vector3().subVectors(this.camera.position, this.camera.pivotPoint);
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    this.camera.position.copy(this.camera.pivotPoint).add(offset);
    this.camera.rotation.y += angle;

    // Handle zoom
    this.camera.setZoom(
      this.camera.zoom +
        this._zoomIncrement * -BaseControls.ZOOM_SENSITIVITY * GAMEPAD_ZOOM_MULTIPLIER
    );
  }

  protected override onUpdate(_deltaTime: number): void {
    super.onUpdate(_deltaTime);
    this._handleCameraMovement();
  }

  protected override onDestroyed(): void {
    super.onDestroyed();

    this._gamepadInput.removeAxisMoveListener('LEFT_STICK_X', this._handleLeftStickXMove);
    this._gamepadInput.removeAxisMoveListener('LEFT_STICK_Y', this._handleLeftStickYMove);
    this._gamepadInput.removeButtonDownListener('RT', this._handleSprintButtonDown);
    this._gamepadInput.removeButtonUpListener('RT', this._handleSprintButtonUp);
  }
}
