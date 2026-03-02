import { GamepadInput } from '@tgdf';

import { BaseControls, BaseControlsOptions } from './BaseControls';

export type GamepadControlsOptions = BaseControlsOptions & {
  gamepadInput: GamepadInput;
};

export class GamepadControls extends BaseControls {
  private _gamepadInput: GamepadInput;

  constructor({ gameObject, camera, cameraLerp, gamepadInput }: GamepadControlsOptions) {
    super({ gameObject, camera, cameraLerp });

    this._gamepadInput = gamepadInput;

    this._handleGamepadInput();
  }

  private _handleGamepadInput(): void {
    this._gamepadInput.addAxisMoveListener('LEFT_STICK_X', (value) => {
      this.direction.x = value;
    });

    this._gamepadInput.addAxisMoveListener('LEFT_STICK_Y', (value) => {
      this.direction.z = value;
    });

    this._gamepadInput.addButtonDownListener('RT', () => {
      this.toggleSprint(true);
    });

    this._gamepadInput.addButtonUpListener('RT', () => {
      this.toggleSprint(false);
    });
  }

  protected override onDestroyed(): void {
    super.onDestroyed();
    this._gamepadInput.removeAllListeners();
  }
}
