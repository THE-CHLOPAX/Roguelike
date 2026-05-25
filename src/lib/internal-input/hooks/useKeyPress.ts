import { Input, InputState } from '@tgdf';
import { useEffect, DependencyList } from 'react';

import { InputNotifiable } from '../Input';

/**
 * Hook that executes a callback when a specific key is pressed.
 *
 * @param key - The key to listen for (case-insensitive, can be key or code)
 * @param callback - Function to call when the key is pressed
 * @param deps - Dependency array for the callback (like useEffect)
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
export function useKeyPress(key: string, callback: () => void, deps: DependencyList = []): void {
  const notifiableObject: InputNotifiable = {
    onInputNotify: (inputState: InputState) => {
      if (inputState.keyboard.isKeyPressed(key)) {
        callback();
      }
    },
  };

  useEffect(() => {
    Input.registerNotifiable(notifiableObject);

    return () => {
      Input.unregisterNotifiable(notifiableObject);
    };
  }, [key, callback, ...deps]);
}
