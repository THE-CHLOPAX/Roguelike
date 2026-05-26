import { GamepadAxis, GamepadButton } from './Gamepad/GamepadMappings';

export class GamepadInput {
  private _pressedButtons = new Set<GamepadButton>();
  private _axisValues = new Map<GamepadAxis | number, number>();
  private _gamepadDisabled = false;
  private _onInputCallback?: () => void;

  public initialize(onInputCallback?: () => void): void {
    this._onInputCallback = onInputCallback;
    // Gamepad uses polling, not event listeners
  }

  public dispose(): void {
    this._pressedButtons.clear();
    this._axisValues.clear();
  }

  public isButtonPressed(button: GamepadButton): boolean {
    return this._pressedButtons.has(button);
  }

  public getAxisValue(axis: GamepadAxis | number): number {
    return this._axisValues.get(axis) ?? 0;
  }

  public get pressedButtons(): Set<GamepadButton> {
    return new Set(this._pressedButtons);
  }

  public get axisValues(): Map<GamepadAxis | number, number> {
    return new Map(this._axisValues);
  }

  public disable(): void {
    this._gamepadDisabled = true;
  }

  public enable(): void {
    this._gamepadDisabled = false;
  }

  public get isDisabled(): boolean {
    return this._gamepadDisabled;
  }

  // Called by Input singleton during update/poll cycle
  public updateState(
    buttonStates: Map<GamepadButton, boolean>,
    axisStates: Map<GamepadAxis | number, number>
  ): void {
    if (this._gamepadDisabled) return;

    let hasChanges = false;

    // Update button states
    for (const [button, pressed] of buttonStates) {
      const wasPressed = this._pressedButtons.has(button);
      if (pressed && !wasPressed) {
        this._pressedButtons.add(button);
        hasChanges = true;
      } else if (!pressed && wasPressed) {
        this._pressedButtons.delete(button);
        hasChanges = true;
      }
    }

    // Update axis values
    for (const [axis, value] of axisStates) {
      const oldValue = this._axisValues.get(axis) ?? 0;
      if (Math.abs(value - oldValue) > 0.01) {
        // Threshold for axis change
        this._axisValues.set(axis, value);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      this._onInputCallback?.();
    }
  }
}
