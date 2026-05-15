import { KeyboardHandlerRecord, KeyMatcher } from '@tgdf';

type KeyPressHandlerRecord = KeyboardHandlerRecord & { threshold: number };

function matchesKey(matcher: KeyMatcher, e: KeyboardEvent): boolean {
  if (typeof matcher === 'function') return matcher(e);
  if (typeof matcher === 'string')
    return (
      e.key.toLowerCase() === matcher.toLowerCase() ||
      e.code.toLowerCase() === matcher.toLowerCase()
    );
  if (Array.isArray(matcher))
    return matcher.some(
      (m) => e.key.toLowerCase() === m.toLowerCase() || e.code.toLowerCase() === m.toLowerCase()
    );
  return false;
}

export class KeyboardInput {
  private _keyAnyInteractionHandlers = new Set<(e: KeyboardEvent) => void>();
  private _pressedKeys = new Map<string, { startTime: number; intervalId?: number }>();
  private _keyDownHandlers = new Set<KeyboardHandlerRecord>();
  private _keyPressHandlers = new Set<KeyPressHandlerRecord>();
  private _keyUpHandlers = new Set<KeyboardHandlerRecord>();

  private _keyboardDisabled = false;

  public initialize(): void {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  public dispose(): void {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);

    // Clear all intervals
    for (const [, keyData] of this._pressedKeys) {
      if (keyData.intervalId) {
        clearInterval(keyData.intervalId);
        clearTimeout(keyData.intervalId);
      }
    }

    // Clear all handlers
    this._keyDownHandlers.clear();
    this._keyPressHandlers.clear();
    this._keyUpHandlers.clear();
    this._keyAnyInteractionHandlers.clear();
    this._pressedKeys.clear();
  }

  public addKeyDownListener(
    matcher: KeyMatcher,
    handler: (e: KeyboardEvent) => void,
    once?: boolean
  ): () => void {
    const wrappedHandler = (e: KeyboardEvent) => {
      handler(e);
      if (once) {
        this._keyDownHandlers.delete(record);
      }
    };
    const record: KeyboardHandlerRecord = { matcher, handler: wrappedHandler };
    this._keyDownHandlers.add(record);
    return () => this._keyDownHandlers.delete(record);
  }

  public addKeyPressListener(
    matcher: KeyMatcher,
    handler: (e: KeyboardEvent) => void,
    thresholdMs: number = 50,
    once?: boolean
  ): () => void {
    const wrappedHandler = (e: KeyboardEvent) => {
      handler(e);
      if (once) {
        this._keyPressHandlers.delete(record);
      }
    };
    const record: KeyPressHandlerRecord = {
      matcher,
      handler: wrappedHandler,
      threshold: thresholdMs,
    };
    this._keyPressHandlers.add(record);
    return () => this._keyPressHandlers.delete(record);
  }

  public addKeyUpListener(
    matcher: KeyMatcher,
    handler: (e: KeyboardEvent) => void,
    once?: boolean
  ): () => void {
    const wrappedHandler = (e: KeyboardEvent) => {
      handler(e);
      if (once) {
        this._keyUpHandlers.delete(record);
      }
    };
    const record: KeyboardHandlerRecord = { matcher, handler: wrappedHandler };
    this._keyUpHandlers.add(record);
    return () => this._keyUpHandlers.delete(record);
  }

  public onKeyboardInteraction(handler: (e: KeyboardEvent) => void, once?: boolean): () => void {
    const wrappedHandler = (e: KeyboardEvent) => {
      handler(e);
      if (once) {
        this._keyAnyInteractionHandlers.delete(wrappedHandler);
      }
    };
    this._keyAnyInteractionHandlers.add(wrappedHandler);
    return () => this._keyAnyInteractionHandlers.delete(wrappedHandler);
  }

  public removeKeyDownListener(matcher: KeyMatcher, handler: (e: KeyboardEvent) => void): void {
    for (const rec of this._keyDownHandlers) {
      if (rec.matcher === matcher && rec.handler === handler) {
        this._keyDownHandlers.delete(rec);
        break;
      }
    }
  }

  public removeKeyPressListener(matcher: KeyMatcher, handler: (e: KeyboardEvent) => void): void {
    for (const rec of this._keyPressHandlers) {
      if (rec.matcher === matcher && rec.handler === handler) {
        this._keyPressHandlers.delete(rec);
        break;
      }
    }
  }

  public removeKeyUpListener(matcher: KeyMatcher, handler: (e: KeyboardEvent) => void): void {
    for (const rec of this._keyUpHandlers) {
      if (rec.matcher === matcher && rec.handler === handler) {
        this._keyUpHandlers.delete(rec);
        break;
      }
    }
  }

  public removeAllListeners(): void {
    this._keyDownHandlers.clear();
    this._keyPressHandlers.clear();
    this._keyUpHandlers.clear();
    this._keyAnyInteractionHandlers.clear();
  }

  public disable(): void {
    this._keyboardDisabled = true;
  }

  public enable(): void {
    this._keyboardDisabled = false;
  }

  private _onKeyDown = (e: KeyboardEvent): void => {
    if (this._keyboardDisabled) return;

    const keyId = String(e.code || e.key).toLowerCase();

    // Fire anyInteraction listeners for any key press
    for (const handler of this._keyAnyInteractionHandlers) {
      try {
        handler(e);
      } catch {
        // swallow handler errors
      }
    }

    // Fire keyDown listeners only once per key press
    if (!this._pressedKeys.has(keyId)) {
      for (const rec of this._keyDownHandlers) {
        try {
          if (matchesKey(rec.matcher, e)) rec.handler(e);
        } catch {
          // swallow handler errors
        }
      }

      // Start tracking this key for keyPress listeners
      const startTime = Date.now();
      this._pressedKeys.set(keyId, { startTime });

      // Set up keyPress listeners with threshold
      for (const rec of this._keyPressHandlers) {
        if (matchesKey(rec.matcher, e)) {
          const threshold = rec.threshold ?? 200; // default 200ms

          const intervalId = window.setTimeout(() => {
            // Start firing repeatedly after threshold
            const repeatingInterval = window.setInterval(() => {
              if (this._keyboardDisabled) return;

              if (this._pressedKeys.has(keyId)) {
                try {
                  rec.handler(e);
                } catch {
                  // swallow handler errors
                }
              }
            }, 1000 / 144); // ~144fps

            const keyData = this._pressedKeys.get(keyId);
            if (keyData) {
              keyData.intervalId = repeatingInterval;
            }
          }, threshold);

          const keyData = this._pressedKeys.get(keyId);
          if (keyData) {
            keyData.intervalId = intervalId;
          }
        }
      }
    }
  };

  private _onKeyUp = (e: KeyboardEvent): void => {
    if (this._keyboardDisabled) return;

    const keyId = String(e.code || e.key).toLowerCase();

    // Clear intervals for this key
    const keyData = this._pressedKeys.get(keyId);
    if (keyData?.intervalId) {
      clearInterval(keyData.intervalId);
      clearTimeout(keyData.intervalId);
    }
    this._pressedKeys.delete(keyId);

    // Fire keyUp listeners
    for (const rec of this._keyUpHandlers) {
      try {
        if (matchesKey(rec.matcher, e)) rec.handler(e);
      } catch {
        // swallow handler errors
      }
    }
  };
}
