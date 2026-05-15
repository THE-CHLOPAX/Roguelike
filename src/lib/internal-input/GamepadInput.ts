import { GamepadAxis, GamepadButton } from './Gamepad/GamepadMappings';

export class GamepadInput {
  private _gamepadButtonDownHandlers = new Map<
    GamepadButton,
    Set<{ handler: () => void; once?: boolean }>
  >();
  private _gamepadButtonUpHandlers = new Map<
    GamepadButton,
    Set<{ handler: () => void; once?: boolean }>
  >();
  private _gamepadButtonPressHandlers = new Map<
    GamepadButton,
    Set<{ handler: (pressed: boolean, value: number) => void; threshold: number; once?: boolean }>
  >();
  private _gamepadAxisMoveHandlers = new Map<
    GamepadAxis | number,
    Set<{ callback: (value: number) => void; once?: boolean }>
  >();
  private _gamepadAnyInteractionHandlers = new Set<{ handler: () => void; once?: boolean }>();
  private _gamepadDisabled = false;

  public dispose(): void {
    this._gamepadButtonDownHandlers.clear();
    this._gamepadButtonUpHandlers.clear();
    this._gamepadButtonPressHandlers.clear();
    this._gamepadAxisMoveHandlers.clear();
    this._gamepadAnyInteractionHandlers.clear();
  }

  public addGamepadButtonDownListener(
    button: GamepadButton,
    handler: () => void,
    once?: boolean
  ): () => void {
    if (!this._gamepadButtonDownHandlers.has(button)) {
      this._gamepadButtonDownHandlers.set(button, new Set());
    }
    const record = { handler, once };
    this._gamepadButtonDownHandlers.get(button)!.add(record);
    return () => this._gamepadButtonDownHandlers.get(button)?.delete(record);
  }

  public addGamepadButtonUpListener(
    button: GamepadButton,
    handler: () => void,
    once?: boolean
  ): () => void {
    if (!this._gamepadButtonUpHandlers.has(button)) {
      this._gamepadButtonUpHandlers.set(button, new Set());
    }
    const record = { handler, once };
    this._gamepadButtonUpHandlers.get(button)!.add(record);
    return () => this._gamepadButtonUpHandlers.get(button)?.delete(record);
  }

  public addGamepadButtonPressListener(
    button: GamepadButton,
    handler: (pressed: boolean, value: number) => void,
    threshold: number = 0,
    once?: boolean
  ): () => void {
    if (!this._gamepadButtonPressHandlers.has(button)) {
      this._gamepadButtonPressHandlers.set(button, new Set());
    }
    const record = { handler, threshold, once };
    this._gamepadButtonPressHandlers.get(button)!.add(record);
    return () => this._gamepadButtonPressHandlers.get(button)?.delete(record);
  }

  public addGamepadAxisMoveListener(
    axis: GamepadAxis | number,
    callback: (value: number) => void,
    once?: boolean
  ): () => void {
    if (!this._gamepadAxisMoveHandlers.has(axis)) {
      this._gamepadAxisMoveHandlers.set(axis, new Set());
    }
    const record = { callback, once };
    this._gamepadAxisMoveHandlers.get(axis)!.add(record);
    return () => this._gamepadAxisMoveHandlers.get(axis)?.delete(record);
  }

  public onGamepadInteraction(handler: () => void, once?: boolean): () => void {
    const record = { handler, once };
    this._gamepadAnyInteractionHandlers.add(record);
    return () => this._gamepadAnyInteractionHandlers.delete(record);
  }

  public removeAllListeners(): void {
    this._gamepadButtonDownHandlers.clear();
    this._gamepadButtonUpHandlers.clear();
    this._gamepadButtonPressHandlers.clear();
    this._gamepadAxisMoveHandlers.clear();
    this._gamepadAnyInteractionHandlers.clear();
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

  // Getters for handlers (useful if the Input class needs to poll gamepad state)
  public get buttonDownHandlers() {
    return this._gamepadButtonDownHandlers;
  }

  public get buttonUpHandlers() {
    return this._gamepadButtonUpHandlers;
  }

  public get buttonPressHandlers() {
    return this._gamepadButtonPressHandlers;
  }

  public get axisMoveHandlers() {
    return this._gamepadAxisMoveHandlers;
  }

  public get anyInteractionHandlers() {
    return this._gamepadAnyInteractionHandlers;
  }
}
