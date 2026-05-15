import { MouseInput } from './MouseInput';
import { GamepadInput } from './GamepadInput';
import { KeyboardInput } from './KeyboardInput';

/**
 * Singleton Input class that manages keyboard, mouse, and gamepad inputs.
 * This class is initialized once and can be accessed from anywhere in the application,
 * both in React components and in three.js scenes/classes.
 */
export class Input {
  private static _instance: Input | null = null;

  private _keyboard: KeyboardInput = new KeyboardInput();
  private _mouse: MouseInput = new MouseInput();
  private _gamepad: GamepadInput = new GamepadInput();

  private _initialized = false;

  /**
   * Get the singleton instance of Input.
   * Initializes it if it hasn't been initialized yet.
   */
  public static getInstance(): Input {
    if (!Input._instance) {
      Input._instance = new Input();
      Input._instance._initialize();
    }
    return Input._instance;
  }

  public get keyboard(): KeyboardInput {
    return this._keyboard;
  }

  public get mouse(): MouseInput {
    return this._mouse;
  }

  public get gamepad(): GamepadInput {
    return this._gamepad;
  }

  public disableAllInput() {
    this._keyboard.disable();
    this._mouse.disable();
    this._gamepad.disable();
  }

  public enableAllInput() {
    this._keyboard.enable();
    this._mouse.enable();
    this._gamepad.enable();
  }

  /**
   * Initialize all event listeners
   */
  private _initialize(): void {
    if (this._initialized) return;

    // Initialize keyboard input
    this._keyboard.initialize();

    // Initialize mouse input
    this._mouse.initialize();

    this._initialized = true;
  }

  /**
   * Cleanup all listeners (typically called on app shutdown)
   */
  public dispose(): void {
    this._keyboard.dispose();
    this._mouse.dispose();
    this._gamepad.dispose();

    this._initialized = false;
  }

  // ==================== KEYBOARD METHODS (delegated to KeyboardInput) ====================
  // These are convenience methods that delegate to the keyboard instance
  // For direct access, use input.keyboard.methodName()

  public addKeyDownListener = this._keyboard.addKeyDownListener.bind(this._keyboard);
  public addKeyPressListener = this._keyboard.addKeyPressListener.bind(this._keyboard);
  public addKeyUpListener = this._keyboard.addKeyUpListener.bind(this._keyboard);
  public onKeyboardInteraction = this._keyboard.onKeyboardInteraction.bind(this._keyboard);
  public removeKeyDownListener = this._keyboard.removeKeyDownListener.bind(this._keyboard);
  public removeKeyPressListener = this._keyboard.removeKeyPressListener.bind(this._keyboard);
  public removeKeyUpListener = this._keyboard.removeKeyUpListener.bind(this._keyboard);
  public removeAllKeyboardListeners = this._keyboard.removeAllListeners.bind(this._keyboard);
  public disableKeyboard = this._keyboard.disable.bind(this._keyboard);
  public enableKeyboard = this._keyboard.enable.bind(this._keyboard);

  // ==================== MOUSE METHODS (delegated to MouseInput) ====================
  // These are convenience methods that delegate to the mouse instance
  // For direct access, use input.mouse.methodName()

  public get mouseX(): number {
    return this._mouse.mouseX;
  }

  public get mouseY(): number {
    return this._mouse.mouseY;
  }

  public addMouseScrollListener = this._mouse.addMouseScrollListener.bind(this._mouse);
  public addMouseMoveListener = this._mouse.addMouseMoveListener.bind(this._mouse);
  public addMouseClickListener = this._mouse.addMouseClickListener.bind(this._mouse);
  public addMouseUpListener = this._mouse.addMouseUpListener.bind(this._mouse);
  public onMouseInteraction = this._mouse.onMouseInteraction.bind(this._mouse);
  public removeMouseScrollListener = this._mouse.removeMouseScrollListener.bind(this._mouse);
  public removeMouseMoveListener = this._mouse.removeMouseMoveListener.bind(this._mouse);
  public removeMouseClickListener = this._mouse.removeMouseClickListener.bind(this._mouse);
  public removeMouseUpListener = this._mouse.removeMouseUpListener.bind(this._mouse);
  public removeAllMouseListeners = this._mouse.removeAllListeners.bind(this._mouse);
  public disableMouse = this._mouse.disable.bind(this._mouse);
  public enableMouse = this._mouse.enable.bind(this._mouse);

  // ==================== GAMEPAD METHODS (delegated to GamepadInput) ====================
  // These are convenience methods that delegate to the gamepad instance
  // For direct access, use input.gamepad.methodName()

  public addGamepadButtonDownListener = this._gamepad.addGamepadButtonDownListener.bind(
    this._gamepad
  );
  public addGamepadButtonUpListener = this._gamepad.addGamepadButtonUpListener.bind(this._gamepad);
  public addGamepadButtonPressListener = this._gamepad.addGamepadButtonPressListener.bind(
    this._gamepad
  );
  public addGamepadAxisMoveListener = this._gamepad.addGamepadAxisMoveListener.bind(this._gamepad);
  public onGamepadInteraction = this._gamepad.onGamepadInteraction.bind(this._gamepad);
  public removeAllGamepadListeners = this._gamepad.removeAllListeners.bind(this._gamepad);
  public disableGamepad = this._gamepad.disable.bind(this._gamepad);
  public enableGamepad = this._gamepad.enable.bind(this._gamepad);
}

// Export a singleton instance for direct imports
export const input = Input.getInstance();
