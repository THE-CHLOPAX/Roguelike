import { useEffect } from 'react';

import { MouseButton } from '../types';
import { useInputState } from './useInputState';

/**
 * Hook that executes a callback when a specific mouse button is pressed.
 *
 * @param button - The mouse button to listen for
 * @param callback - Function to call when the button is pressed
 * @param deps - Dependency array for the callback (like useEffect)
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
export function useMouseButton(
  button: MouseButton,
  callback: () => void,
  deps: React.DependencyList = []
): void {
  const inputState = useInputState();

  useEffect(() => {
    if (inputState.mouse.isButtonPressed(button)) {
      callback();
    }
  }, [inputState, button, ...deps]);
}
