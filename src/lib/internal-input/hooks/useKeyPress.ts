import { Input, InputState } from '@tgdf';
import { useEffect, useState } from 'react';

import { InputNotifiable } from '../Input';

/**
 * Hook that executes a callback when a specific key is pressed.
 *
 * @param key - The key to listen for (case-insensitive, can be key or code)
 * @param callback - Function to call when the key is pressed
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   useKeyPress('Escape', () => {
 *     console.log('Escape pressed!');
 *   }, []);
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useKeyPress(key: string, callback: () => void): void {
  const [isPressed, setIsPressed] = useState(false);

  const notifiableObject: InputNotifiable = {
    onInputNotify: (inputState: InputState) => {
      setIsPressed(inputState.keyboard.isKeyPressed(key));
    },
  };

  useEffect(() => {
    if (isPressed) {
      callback();
    }
  }, [isPressed]);

  useEffect(() => {
    Input.registerNotifiable(notifiableObject);

    return () => {
      Input.unregisterNotifiable(notifiableObject);
    };
  }, []);
}
