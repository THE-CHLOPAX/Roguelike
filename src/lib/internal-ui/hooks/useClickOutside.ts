import type { RefObject } from 'react';

import { useEffect, useRef } from 'react';

/**
 * Hook that calls a callback when a mousedown/pointerdown happens outside
 * of the given ref's element.
 *
 * @param ref - Ref of the element to detect outside clicks for
 * @param onClickOutside - Function to call when a click outside is detected
 * @param enabled - Whether the listener is active (default: true)
 *
 * @example
 * ```tsx
 * function MyDropdown() {
 *   const [open, setOpen] = useState(false);
 *   const containerRef = useRef<HTMLDivElement>(null);
 *
 *   useClickOutside(containerRef, () => setOpen(false), open);
 *
 *   return <div ref={containerRef}>...</div>;
 * }
 * ```
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onClickOutside: () => void,
  enabled: boolean = true
): void {
  const onClickOutsideRef = useRef(onClickOutside);
  onClickOutsideRef.current = onClickOutside;

  useEffect(() => {
    if (!enabled) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutsideRef.current();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [ref, enabled]);
}
