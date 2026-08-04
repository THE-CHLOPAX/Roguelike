export class KeyboardInput {
  private _pressedKeys = new Set<string>();
  private _keyboardDisabled = false;
  private _onInputCallback?: () => void;

  public initialize(onInputCallback?: () => void): void {
    this._onInputCallback = onInputCallback;
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onWindowEvents);
    window.addEventListener('focus', this._onWindowEvents);
  }

  public dispose(): void {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('blur', this._onWindowEvents);
    window.removeEventListener('focus', this._onWindowEvents);
    this._pressedKeys.clear();
  }

  public isKeyPressed(key: string): boolean {
    return this._pressedKeys.has(key.toLowerCase());
  }

  public get pressedKeys(): Set<string> {
    return new Set(this._pressedKeys);
  }

  public disable(): void {
    this._keyboardDisabled = true;
  }

  public enable(): void {
    this._keyboardDisabled = false;
  }

  private _onKeyDown = (e: KeyboardEvent): void => {
    if (this._keyboardDisabled) return;

    const key = e.key.toLowerCase();
    const code = e.code.toLowerCase();

    if (!this._pressedKeys.has(key)) {
      this._pressedKeys.add(key);
    }
    if (!this._pressedKeys.has(code)) {
      this._pressedKeys.add(code);
    }

    this._onInputCallback?.();
  };

  private _onKeyUp = (e: KeyboardEvent): void => {
    if (this._keyboardDisabled) return;

    const key = e.key.toLowerCase();
    const code = e.code.toLowerCase();

    this._pressedKeys.delete(key);
    this._pressedKeys.delete(code);

    this._onInputCallback?.();
  };

  private _onWindowEvents = (): void => {
    if (this._pressedKeys.size === 0) return;

    this._pressedKeys.clear();
    this._onInputCallback?.();
  };
}
