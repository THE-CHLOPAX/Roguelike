import { GamepadInstance, SceneConstructorOptions, useGamepadStore } from '@tgdf';
import { ControlledGamepadBox } from '@3D/classes/gameObjects/ControlledGamepadBox';

import { TestScene } from './TestScene';

export class GamepadControlsTestScene extends TestScene {
  private _gamepadStoreEvents = useGamepadStore.getState().gamepadEvents;

  constructor(options: SceneConstructorOptions) {
    super(options);

    this._gamepadStoreEvents = useGamepadStore.getState().gamepadEvents;

    const connectedGamepads = useGamepadStore.getState().connectedGamepads;
    if (connectedGamepads.size > 0) {
      const firstGamepad = connectedGamepads.values().next().value;
      if (firstGamepad) this._onGamepadConnected({ gamepad: firstGamepad });
    } else {
      this._gamepadStoreEvents.on('gamepadconnected', this._onGamepadConnected);
    }
  }

  private _onGamepadConnected = ({ gamepad }: { gamepad: GamepadInstance }) => {
    const controlledGamepadBox = new ControlledGamepadBox(this, gamepad);
    controlledGamepadBox.position.set(0, 1, 0);
    this.add(controlledGamepadBox);
  };

  protected onDestroy(): void {
    this._gamepadStoreEvents.off('gamepadconnected', this._onGamepadConnected);
  }
}
