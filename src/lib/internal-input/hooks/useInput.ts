import { Input } from '../Input';

/**
 * React hook that returns the global Input singleton instance.
 * This provides convenient access to input handling in React components.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const input = useInput();
 *   
 *   useEffect(() => {
 *     const cleanup = input.addKeyDownListener('Escape', () => {
 *       console.log('Escape pressed!');
 *     });
 *     return cleanup;
 *   }, [input]);
 * }
 * ```
 */
export function useInput(): Input {
  return Input.getInstance();
}
