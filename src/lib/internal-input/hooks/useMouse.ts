import { useEffect, useRef } from 'react';
import { ButtonMatcher, MouseHandlerRecord, MouseButton, MouseInput } from '@tgdf';

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

/**
 * Hook that tracks mouse position and exposes callback functions for mouse events:
 * - addMouseMoveListener: listens on "mousemove"
 * - addMouseClickListener: listens on "mousedown" for specific button(s)
 * - onAnyInteraction: fires on any mouse move or click
 *
 * Uses refs instead of state to avoid unnecessary re-renders on mouse movement.
 */
export function useMouse(): MouseInput {
  // Use refs instead of state to avoid re-renders on mouse move
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);

  const disabledRef = useRef<boolean>(false);

  // Centralized sets for default (window) listeners
  const mouseScrollHandlers = useRef<Set<(e: WheelEvent) => void>>(new Set());
  const mouseMoveHandlers = useRef<Set<(e: MouseEvent) => void>>(new Set());
  const mouseClickHandlers = useRef<Set<MouseHandlerRecord>>(new Set());
  const mouseUpHandlers = useRef<Set<MouseHandlerRecord>>(new Set());
  const anyInteractionHandlers = useRef<Set<(e: MouseEvent) => void>>(new Set());

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (disabledRef.current) return;

      mouseXRef.current = e.clientX;
      mouseYRef.current = e.clientY;

      for (const handler of mouseMoveHandlers.current) {
        try {
          handler(e);
        } catch {
          // swallow handler errors to avoid breaking others
        }
      }
    }

    function onMouseScroll(e: WheelEvent) {
      if (disabledRef.current) return;

      // Fire anyInteraction listeners
      for (const handler of anyInteractionHandlers.current) {
        try {
          handler(e);
        } catch {
          // swallow handler errors
        }
      }

      for (const handler of mouseScrollHandlers.current) {
        try {
          handler(e);
        } catch {
          // swallow handler errors
        }
      }
    }

    function onMouseDown(e: MouseEvent) {
      if (disabledRef.current) return;

      // Fire anyInteraction listeners
      for (const handler of anyInteractionHandlers.current) {
        try {
          handler(e);
        } catch {
          // swallow handler errors
        }
      }

      for (const rec of mouseClickHandlers.current) {
        try {
          if (matchesButton(rec.matcher, e)) rec.handler(e);
        } catch {
          // swallow handler errors
        }
      }
    }

    function onMouseUp(e: MouseEvent) {
      if (disabledRef.current) return;

      // Fire anyInteraction listeners
      for (const handler of anyInteractionHandlers.current) {
        try {
          handler(e);
        } catch {
          // swallow handler errors
        }
      }

      for (const rec of mouseUpHandlers.current) {
        try {
          if (matchesButton(rec.matcher, e)) rec.handler(e);
        } catch {
          // swallow handler errors
        }
      }
    }

    window.addEventListener('wheel', onMouseScroll);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('wheel', onMouseScroll);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      mouseScrollHandlers.current.clear();
      mouseMoveHandlers.current.clear();
      mouseClickHandlers.current.clear();
      mouseUpHandlers.current.clear();
      anyInteractionHandlers.current.clear();
    };
  }, []);

  function addMouseScrollListener(handler: (e: WheelEvent) => void, once?: boolean): () => void {
    const wrappedHandler = (e: WheelEvent) => {
      handler(e);
      if (once) {
        mouseScrollHandlers.current.delete(wrappedHandler);
      }
    };
    mouseScrollHandlers.current.add(wrappedHandler);
    return () => mouseScrollHandlers.current.delete(wrappedHandler);
  }

  function addMouseMoveListener(handler: (e: MouseEvent) => void, once?: boolean): () => void {
    const wrappedHandler = (e: MouseEvent) => {
      handler(e);
      if (once) {
        mouseMoveHandlers.current.delete(wrappedHandler);
      }
    };
    mouseMoveHandlers.current.add(wrappedHandler);
    return () => mouseMoveHandlers.current.delete(wrappedHandler);
  }

  function addMouseClickListener(
    matcher: ButtonMatcher,
    handler: (e: MouseEvent) => void,
    once?: boolean
  ): () => void {
    const wrappedHandler = (e: MouseEvent) => {
      handler(e);
      if (once) {
        mouseClickHandlers.current.delete(record);
      }
    };
    const record: MouseHandlerRecord = { matcher, handler: wrappedHandler };
    mouseClickHandlers.current.add(record);
    return () => mouseClickHandlers.current.delete(record);
  }

  function addMouseUpListener(
    matcher: ButtonMatcher,
    handler: (e: MouseEvent) => void,
    once?: boolean
  ): () => void {
    const wrappedHandler = (e: MouseEvent) => {
      handler(e);
      if (once) {
        mouseUpHandlers.current.delete(record);
      }
    };
    const record: MouseHandlerRecord = { matcher, handler: wrappedHandler };
    mouseUpHandlers.current.add(record);
    return () => mouseUpHandlers.current.delete(record);
  }

  function onAnyInteraction(
    handler: (e: MouseEvent | WheelEvent) => void,
    once?: boolean
  ): () => void {
    const wrappedHandler = (e: MouseEvent | WheelEvent) => {
      handler(e);
      if (once) {
        anyInteractionHandlers.current.delete(wrappedHandler);
      }
    };
    anyInteractionHandlers.current.add(wrappedHandler);
    return () => anyInteractionHandlers.current.delete(wrappedHandler);
  }

  function removeMouseScrollListener(handler: (e: WheelEvent) => void) {
    mouseScrollHandlers.current.delete(handler);
  }

  function removeMouseMoveListener(handler: (e: MouseEvent) => void) {
    mouseMoveHandlers.current.delete(handler);
  }

  function removeMouseClickListener(matcher: ButtonMatcher, handler: (e: MouseEvent) => void) {
    for (const rec of mouseClickHandlers.current) {
      if (rec.matcher === matcher && rec.handler === handler) {
        mouseClickHandlers.current.delete(rec);
        break;
      }
    }
  }

  function removeMouseUpListener(matcher: ButtonMatcher, handler: (e: MouseEvent) => void) {
    for (const rec of mouseUpHandlers.current) {
      if (rec.matcher === matcher && rec.handler === handler) {
        mouseUpHandlers.current.delete(rec);
        break;
      }
    }
  }

  function removeAllListeners() {
    mouseMoveHandlers.current.clear();
    mouseClickHandlers.current.clear();
    anyInteractionHandlers.current.clear();
  }

  function disable() {
    disabledRef.current = true;
  }

  function enable() {
    disabledRef.current = false;
  }

  return {
    get mouseX() {
      return mouseXRef.current;
    },
    get mouseY() {
      return mouseYRef.current;
    },
    addMouseScrollListener,
    addMouseMoveListener,
    addMouseClickListener,
    addMouseUpListener,
    onAnyInteraction,
    removeMouseScrollListener,
    removeMouseMoveListener,
    removeMouseClickListener,
    removeMouseUpListener,
    removeAllListeners,
    disable,
    enable,
  };
}
