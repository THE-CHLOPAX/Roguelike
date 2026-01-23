import { useEffect, useRef } from 'react';
import { KeyMatcher, KeyboardInput, KeyboardHandlerRecord } from '@tgdf';

function matches(matcher: KeyMatcher, e: KeyboardEvent): boolean {
    if (typeof matcher === 'function') return matcher(e);
    if (typeof matcher === 'string') return e.key === matcher || e.code === matcher;
    if (Array.isArray(matcher)) return matcher.some((m) => e.key === m || e.code === m);
    return false;
}

/**
 * Hook that exposes keyboard event listeners:
 * - addKeyDownListener: fires once when key is first pressed down
 * - addKeyPressListener: fires repeatedly while key is held (with threshold delay before starting)
 * - addKeyUpListener: fires when key is released
 * - onAnyInteraction: fires once when any key is pressed
 */
export function useKeyboard(): KeyboardInput {
    const keyDownHandlers = useRef<Set<KeyboardHandlerRecord>>(new Set());
    const keyPressHandlers = useRef<Set<KeyboardHandlerRecord & { threshold?: number }>>(new Set());
    const keyUpHandlers = useRef<Set<KeyboardHandlerRecord>>(new Set());
    const anyInteractionHandlers = useRef<Set<(e: KeyboardEvent) => void>>(new Set());

    // Track pressed keys and their press timers
    const pressedKeys = useRef<Map<string, { startTime: number; intervalId?: number }>>(new Map());

    const disabledRef = useRef<boolean>(false);

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            const keyId = e.code || e.key;

            // Fire anyInteraction listeners for any key press
            for (const handler of anyInteractionHandlers.current) {
                try {
                    handler(e);
                } catch {
                    // swallow handler errors
                }
            }

            // Fire keyDown listeners only once per key press
            if (!pressedKeys.current.has(keyId)) {
                for (const rec of keyDownHandlers.current) {
                    try {
                        if (matches(rec.matcher, e)) rec.handler(e);
                    } catch {
                        // swallow handler errors
                    }
                }

                // Start tracking this key for keyPress listeners
                const startTime = Date.now();
                pressedKeys.current.set(keyId, { startTime });

                // Set up keyPress listeners with threshold
                for (const rec of keyPressHandlers.current) {
                    if (matches(rec.matcher, e)) {
                        const threshold = rec.threshold ?? 200; // default 200ms

                        const intervalId = window.setTimeout(() => {
                            // Start firing repeatedly after threshold
                            const repeatingInterval = window.setInterval(() => {
                                // If disabled, stop firing
                                if (disabledRef.current) return;

                                if (pressedKeys.current.has(keyId)) {
                                    try {
                                        rec.handler(e);
                                    } catch {
                                        // swallow handler errors
                                    }
                                }
                            }, 1000 / 144); // ~144fps

                            const keyData = pressedKeys.current.get(keyId);
                            if (keyData) {
                                keyData.intervalId = repeatingInterval;
                            }
                        }, threshold);

                        const keyData = pressedKeys.current.get(keyId);
                        if (keyData) {
                            keyData.intervalId = intervalId;
                        }
                    }
                }
            }
        }

        function onKeyUp(e: KeyboardEvent) {
            const keyId = e.code || e.key;

            // Clear intervals for this key
            const keyData = pressedKeys.current.get(keyId);
            if (keyData?.intervalId) {
                clearInterval(keyData.intervalId);
                clearTimeout(keyData.intervalId);
            }
            pressedKeys.current.delete(keyId);

            // Fire keyUp listeners
            for (const rec of keyUpHandlers.current) {
                try {
                    if (matches(rec.matcher, e)) rec.handler(e);
                } catch {
                    // swallow handler errors
                }
            }
        }

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);

            // Clear all intervals
            for (const [, keyData] of pressedKeys.current) {
                if (keyData.intervalId) {
                    clearInterval(keyData.intervalId);
                    clearTimeout(keyData.intervalId);
                }
            }
            pressedKeys.current.clear();

            keyDownHandlers.current.clear();
            keyPressHandlers.current.clear();
            keyUpHandlers.current.clear();
            anyInteractionHandlers.current.clear();
        };
    }, []);

    function addKeyDownListener(
        matcher: KeyMatcher,
        handler: (e: KeyboardEvent) => void,
        once?: boolean,
    ): () => void {
        const wrappedHandler = (e: KeyboardEvent) => {
            handler(e);
            if (once) {
                keyDownHandlers.current.delete(record);
            }
        };
        const record: KeyboardHandlerRecord = { matcher, handler: wrappedHandler };
        keyDownHandlers.current.add(record);
        return () => keyDownHandlers.current.delete(record);
    }

    function addKeyPressListener(
        matcher: KeyMatcher,
        handler: (e: KeyboardEvent) => void,
        thresholdMs: number = 50,
        once?: boolean
    ): () => void {
        const wrappedHandler = (e: KeyboardEvent) => {
            handler(e);
            if (once) {
                keyPressHandlers.current.delete(record);
            }
        };
        const record: KeyboardHandlerRecord & { threshold: number } = { matcher, handler: wrappedHandler, threshold: thresholdMs };
        keyPressHandlers.current.add(record);
        return () => keyPressHandlers.current.delete(record);
    }

    function addKeyUpListener(
        matcher: KeyMatcher,
        handler: (e: KeyboardEvent) => void,
        once?: boolean
    ): () => void {
        const wrappedHandler = (e: KeyboardEvent) => {
            handler(e);
            if (once) {
                keyUpHandlers.current.delete(record);
            }
        };
        const record: KeyboardHandlerRecord = { matcher, handler: wrappedHandler };
        keyUpHandlers.current.add(record);
        return () => keyUpHandlers.current.delete(record);
    }

    function onAnyInteraction(handler: (e: KeyboardEvent) => void, once?: boolean): () => void {
        const wrappedHandler = (e: KeyboardEvent) => {
            handler(e);
            if (once) {
                anyInteractionHandlers.current.delete(wrappedHandler);
            }
        };
        anyInteractionHandlers.current.add(wrappedHandler);
        return () => anyInteractionHandlers.current.delete(wrappedHandler);
    }

    function removeKeyDownListener(matcher: KeyMatcher, handler: (e: KeyboardEvent) => void) {
        for (const rec of keyDownHandlers.current) {
            if (rec.matcher === matcher && rec.handler === handler) {
                keyDownHandlers.current.delete(rec);
                break;
            }
        }
    }

    function removeKeyPressListener(matcher: KeyMatcher, handler: (e: KeyboardEvent) => void) {
        for (const rec of keyPressHandlers.current) {
            if (rec.matcher === matcher && rec.handler === handler) {
                keyPressHandlers.current.delete(rec);
                break;
            }
        }
    }

    function removeKeyUpListener(matcher: KeyMatcher, handler: (e: KeyboardEvent) => void) {
        for (const rec of keyUpHandlers.current) {
            if (rec.matcher === matcher && rec.handler === handler) {
                keyUpHandlers.current.delete(rec);
                break;
            }
        }
    }

    function removeAllListeners() {
        keyDownHandlers.current.clear();
        keyPressHandlers.current.clear();
        keyUpHandlers.current.clear();
        anyInteractionHandlers.current.clear();
    }

    function disable() {
        disabledRef.current = true;
    }

    function enable() {
        disabledRef.current = false;
    }

    return {
        addKeyDownListener,
        addKeyPressListener,
        addKeyUpListener,
        onAnyInteraction,
        removeKeyDownListener,
        removeKeyPressListener,
        removeKeyUpListener,
        removeAllListeners,
        disable,
        enable,
    };
}