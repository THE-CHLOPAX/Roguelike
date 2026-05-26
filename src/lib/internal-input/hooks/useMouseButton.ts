import { Input } from '@tgdf';
import { useEffect } from 'react';

import { InputNotifiable } from '../Input';
import { InputState, MouseButton } from '../types';

/**
 * Hook that executes a callback when a specific mouse button is pressed.
 *
 * @param button - The mouse button to listen for
 * @param callback - Function to call when the button is pressed
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   useMouseButton('left', () => {
 *     console.log('Left mouse button pressed!');
 *   }, []);
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useMouseButton(button: MouseButton, callback: () => void): void {
  const notifiableObject: InputNotifiable = {
    onInputNotify: (inputState: InputState) => {
      if (inputState.mouse.isButtonPressed(button)) {
        callback();
      }
    },
  };
  useEffect(() => {
    Input.registerNotifiable(notifiableObject);

    return () => {
      Input.unregisterNotifiable(notifiableObject);
    };
  }, []);
}
