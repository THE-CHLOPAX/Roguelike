import { ButtonMatcher, MouseButton, MouseHandlerRecord } from '@tgdf';

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

function matchesButton(matcher: ButtonMatcher, e: MouseEvent): boolean {
  if (typeof matcher === 'function') return matcher(e);

  const buttonName = getButtonName(e.button);
  if (!buttonName) return false;

  if (typeof matcher === 'string') return buttonName === matcher;
  if (Array.isArray(matcher)) return matcher.includes(buttonName);
  return false;
}

export class MouseInput {
  private _mouseX = 0;
  private _mouseY = 0;
  private _mouseScrollHandlers = new Set<(e: WheelEvent) => void>();
  private _mouseMoveHandlers = new Set<(e: MouseEvent) => void>();
  private _mouseClickHandlers = new Set<MouseHandlerRecord>();
  private _mouseUpHandlers = new Set<MouseHandlerRecord>();
  private _mouseAnyInteractionHandlers = new Set<(e: MouseEvent) => void>();
  private _mouseDisabled = false;

  public initialize(): void {
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

    this._mouseScrollHandlers.clear();
    this._mouseMoveHandlers.clear();
    this._mouseClickHandlers.clear();
    this._mouseUpHandlers.clear();
    this._mouseAnyInteractionHandlers.clear();
  }

  public get mouseX(): number {
    return this._mouseX;
  }

  public get mouseY(): number {
    return this._mouseY;
  }

  public addMouseScrollListener(handler: (e: WheelEvent) => void, once?: boolean): () => void {
    const wrappedHandler = (e: WheelEvent) => {
      handler(e);
      if (once) {
        this._mouseScrollHandlers.delete(wrappedHandler);
      }
    };
    this._mouseScrollHandlers.add(wrappedHandler);
    return () => this._mouseScrollHandlers.delete(wrappedHandler);
  }

  public addMouseMoveListener(handler: (e: MouseEvent) => void, once?: boolean): () => void {
    const wrappedHandler = (e: MouseEvent) => {
      handler(e);
      if (once) {
        this._mouseMoveHandlers.delete(wrappedHandler);
      }
    };
    this._mouseMoveHandlers.add(wrappedHandler);
    return () => this._mouseMoveHandlers.delete(wrappedHandler);
  }

  public addMouseClickListener(
    matcher: ButtonMatcher,
    handler: (e: MouseEvent) => void,
    once?: boolean
  ): () => void {
    const wrappedHandler = (e: MouseEvent) => {
      handler(e);
      if (once) {
        this._mouseClickHandlers.delete(record);
      }
    };
    const record: MouseHandlerRecord = { matcher, handler: wrappedHandler };
    this._mouseClickHandlers.add(record);
    return () => this._mouseClickHandlers.delete(record);
  }

  public addMouseUpListener(
    matcher: ButtonMatcher,
    handler: (e: MouseEvent) => void,
    once?: boolean
  ): () => void {
    const wrappedHandler = (e: MouseEvent) => {
      handler(e);
      if (once) {
        this._mouseUpHandlers.delete(record);
      }
    };
    const record: MouseHandlerRecord = { matcher, handler: wrappedHandler };
    this._mouseUpHandlers.add(record);
    return () => this._mouseUpHandlers.delete(record);
  }

  public onMouseInteraction(handler: (e: MouseEvent) => void, once?: boolean): () => void {
    const wrappedHandler = (e: MouseEvent) => {
      handler(e);
      if (once) {
        this._mouseAnyInteractionHandlers.delete(wrappedHandler);
      }
    };
    this._mouseAnyInteractionHandlers.add(wrappedHandler);
    return () => this._mouseAnyInteractionHandlers.delete(wrappedHandler);
  }

  public removeMouseScrollListener(handler: (e: WheelEvent) => void): void {
    this._mouseScrollHandlers.delete(handler);
  }

  public removeMouseMoveListener(handler: (e: MouseEvent) => void): void {
    this._mouseMoveHandlers.delete(handler);
  }

  public removeMouseClickListener(matcher: ButtonMatcher, handler: (e: MouseEvent) => void): void {
    for (const rec of this._mouseClickHandlers) {
      if (rec.matcher === matcher && rec.handler === handler) {
        this._mouseClickHandlers.delete(rec);
        break;
      }
    }
  }

  public removeMouseUpListener(matcher: ButtonMatcher, handler: (e: MouseEvent) => void): void {
    for (const rec of this._mouseUpHandlers) {
      if (rec.matcher === matcher && rec.handler === handler) {
        this._mouseUpHandlers.delete(rec);
        break;
      }
    }
  }

  public removeAllListeners(): void {
    this._mouseScrollHandlers.clear();
    this._mouseMoveHandlers.clear();
    this._mouseClickHandlers.clear();
    this._mouseUpHandlers.clear();
    this._mouseAnyInteractionHandlers.clear();
  }

  public disable(): void {
    this._mouseDisabled = true;
  }

  public enable(): void {
    this._mouseDisabled = false;
  }

  private _onMouseScroll = (e: WheelEvent): void => {
    if (this._mouseDisabled) return;

    for (const handler of this._mouseScrollHandlers) {
      try {
        handler(e);
      } catch {
        // swallow handler errors
      }
    }
  };

  private _onMouseMove = (e: MouseEvent): void => {
    this._mouseX = e.clientX;
    this._mouseY = e.clientY;

    if (this._mouseDisabled) return;

    // Fire anyInteraction listeners
    for (const handler of this._mouseAnyInteractionHandlers) {
      try {
        handler(e);
      } catch {
        // swallow handler errors
      }
    }

    for (const handler of this._mouseMoveHandlers) {
      try {
        handler(e);
      } catch {
        // swallow handler errors
      }
    }
  };

  private _onMouseClick = (e: MouseEvent): void => {
    if (this._mouseDisabled) return;

    // Fire anyInteraction listeners
    for (const handler of this._mouseAnyInteractionHandlers) {
      try {
        handler(e);
      } catch {
        // swallow handler errors
      }
    }

    for (const rec of this._mouseClickHandlers) {
      try {
        if (matchesButton(rec.matcher, e)) rec.handler(e);
      } catch {
        // swallow handler errors
      }
    }
  };

  private _onMouseUp = (e: MouseEvent): void => {
    if (this._mouseDisabled) return;

    for (const rec of this._mouseUpHandlers) {
      try {
        if (matchesButton(rec.matcher, e)) rec.handler(e);
      } catch {
        // swallow handler errors
      }
    }
  };
}
