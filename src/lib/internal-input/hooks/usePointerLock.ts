import { useCallback, useEffect, useRef, useState } from 'react';

import { logger } from '../../internal-ui/utils/logger';

export interface UsePointerLockOptions {
    onLockEnter?: () => void;
    onLockExit?: () => void;
}

export interface UsePointerLockReturn {
    isLocked: boolean;
    enterPointerLock: () => void;
    exitPointerLock: () => void;
}

// For some reason, there is a cooldown for re-entering
// the pointer lock mode after it has been exited.
export const POINTER_LOCK_REENABLE_COOLDOWN = 1300; // ms

/**
 * Hook for managing pointer lock state on document.body
 * 
 * @example
 * const { isLocked, enterPointerLock, exitPointerLock } = usePointerLock({
 *   onLockEnter: () => console.log('Pointer locked'),
 *   onLockExit: () => console.log('Pointer unlocked')
 * });
 */
export function usePointerLock(options?: UsePointerLockOptions): UsePointerLockReturn {
    const [isLocked, setIsLocked] = useState(false);
    const optionsRef = useRef(options);

    // Keep options ref up to date
    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    const enterPointerLock = useCallback(() => {
        if (document.body.requestPointerLock) {
            document.body.requestPointerLock().catch((error: Error) => {
                // Silently handle pointer lock errors (usually happens when user exits lock before request completes)
                if (error.message.includes('exited the lock')) {
                    logger({ message: 'PointerLock request was exited before completion', type: 'info' });
                    return;
                }
                logger({ message: `PointerLock error: ${error.message}`, type: 'warn' });
            });
        }
    }, []);

    const exitPointerLock = useCallback(() => {
        if (document.pointerLockElement && document.exitPointerLock) {
            document.exitPointerLock();
        }
    }, []);

    useEffect(() => {
        const handlePointerLockChange = () => {
            const locked = document.pointerLockElement === document.body;
            setIsLocked(locked);

            // Call appropriate callback
            if (locked) {
                optionsRef.current?.onLockEnter?.();
            } else {
                optionsRef.current?.onLockExit?.();
            }
        };

        const handlePointerLockError = () => {
            logger({ message: 'Pointer lock error occurred', type: 'warn' });
        };

        // Add event listeners
        document.addEventListener('pointerlockchange', handlePointerLockChange);
        document.addEventListener('pointerlockerror', handlePointerLockError);

        // Check initial state
        setIsLocked(document.pointerLockElement === document.body);

        // Cleanup
        return () => {
            document.removeEventListener('pointerlockchange', handlePointerLockChange);
            document.removeEventListener('pointerlockerror', handlePointerLockError);
        };
    }, []);

    return {
        isLocked,
        enterPointerLock,
        exitPointerLock,
    };
}
