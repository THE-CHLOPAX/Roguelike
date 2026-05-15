import { MouseButton } from '@tgdf';

function getButtonName(button: number): MouseButton | null {
  switch (button) {
    case 0:
      return 'left';
    case 1:
      return 'middle';
    case 2:
      return 'right';
    default:
      return null;
  }
}

export class MouseInput {
  private _mouseX = 0;
  private _mouseY = 0;
  private _wheelDelta = 0;
  private _pressedButtons = new Set<MouseButton>();
  private _mouseDisabled = false;
  private _onInputCallback?: () => void;

  public initialize(onInputCallback?: () => void): void {
    this._onInputCallback = onInputCallback;
    window.addEventListener('wheel', this._onMouseScroll);
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mousedown', this._onMouseClick);
    window.addEventListener('mouseup', this._onMouseUp);
  }

  public dispose(): void {
    window.removeEventListener('wheel', this._onMouseScroll);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mousedown', this._onMouseClick);
    window.removeEventListener('mouseup', this._onMouseUp);

    this._pressedButtons.clear();
  }

  public get mouseX(): number {
    return this._mouseX;
  }

  public get mouseY(): number {
    return this._mouseY;
  }

  public get wheelDelta(): number {
    return this._wheelDelta;
  }

  public isButtonPressed(button: MouseButton): boolean {
    return this._pressedButtons.has(button);
  }

  public get pressedButtons(): Set<MouseButton> {
    return new Set(this._pressedButtons);
  }

  public disable(): void {
    this._mouseDisabled = true;
  }

  public enable(): void {
    this._mouseDisabled = false;
  }

  private _onMouseScroll = (e: WheelEvent): void => {
    if (this._mouseDisabled) return;

    this._wheelDelta = e.deltaY;
    this._onInputCallback?.();
  };

  private _onMouseMove = (e: MouseEvent): void => {
    this._mouseX = e.clientX;
    this._mouseY = e.clientY;

    if (this._mouseDisabled) return;

    this._onInputCallback?.();
  };

  private _onMouseClick = (e: MouseEvent): void => {
    if (this._mouseDisabled) return;

    const buttonName = getButtonName(e.button);
    if (buttonName) {
      this._pressedButtons.add(buttonName);
    }

    this._onInputCallback?.();
  };

  private _onMouseUp = (e: MouseEvent): void => {
    if (this._mouseDisabled) return;

    const buttonName = getButtonName(e.button);
    if (buttonName) {
      this._pressedButtons.delete(buttonName);
    }

    this._onInputCallback?.();
  };
}
