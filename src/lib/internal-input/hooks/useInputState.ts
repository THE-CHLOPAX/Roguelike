import type { GameObject } from '@tgdf';

import { useEffect, useState } from 'react';

import { Input } from '../Input';
import { InputState } from '../types';

/**
 * Hook that provides reactive access to input state in React components.
 * Re-renders the component whenever any input changes.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const inputState = useInputState();
 *
 *   if (inputState.keyboard.isKeyPressed('w')) {
 *     // Handle 'w' key
 *   }
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useInputState(): InputState {
  const [state, setState] = useState<InputState>(() => Input.getInstance().getState());

  useEffect(() => {
    const input = Input.getInstance();

    // Create a mock GameObject to receive input callbacks
    const listener: Pick<GameObject, 'onInput'> = {
      onInput: (inputState: InputState) => {
        setState(inputState);
      },
    };

    input.registerGameObject(listener as GameObject);

    return () => {
      input.unregisterGameObject(listener as GameObject);
    };
  }, []);

  return state;
}
