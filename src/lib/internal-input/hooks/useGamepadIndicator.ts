import { useEffect, useMemo, useState } from 'react';

import { useGamepadStore } from '../../internal-store/useGamepadStore';

export function useGamepadIndicator({ gamepadIndex }: { gamepadIndex: number }) {
    const { connectedGamepads } = useGamepadStore();
    const [indicatorIndex, setIndicatorIndex] = useState<number>(0);

    const gamepad = useMemo(() => connectedGamepads.get(gamepadIndex), [connectedGamepads, gamepadIndex]);

    useEffect(() => {
        gamepad?.addButtonDownListener('DPAD_UP', () => {
            setIndicatorIndex(prev => {
                if (prev === 0) {
                    return 0;
                }
                return prev - 1;
            });
        });

        gamepad?.addButtonDownListener('DPAD_DOWN', () => {
            setIndicatorIndex(prev => {
                return prev + 1;
            });
        });
    }, [gamepad]);

    return { indicatorIndex };
}