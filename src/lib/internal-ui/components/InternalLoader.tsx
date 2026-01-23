import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import { InternalFlex, InternalText } from '@tgdf';

const ON_COMPLETE_DELAY_MS = 500;

export function InternalLoader({ progress, style, onComplete }: {
    progress: number,
    style?: React.CSSProperties,
    onComplete?: () => void
}) {

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const textRef = useRef<HTMLSpanElement | null>(null);
    const tweenRef = useRef<GSAPTween | null>(null);
    const progressRef = useRef<number>(progress);

    useEffect(() => {
        tweenRef.current = gsap.to(progressRef,{
            current: progress,
            duration: 0.5,
            ease: 'none',
            onUpdate: () => {
                if (textRef.current) {
                    textRef.current.textContent = `Loading: ${Math.round(progressRef.current)}%`;
                }
            },
            onComplete: () => {
                if (progressRef.current >= 100) {
                    timeoutRef.current = setTimeout(() => {
                        onComplete?.();
                    }, ON_COMPLETE_DELAY_MS);
                }
            }
        });

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (tweenRef.current) {
                tweenRef.current.kill();
            }
        };
    }, [progress]);

    return (
        <InternalFlex
            direction="column"
            align="center"
            justify="center"
            style={{ height: '100vh', width: '100vw', backgroundColor: '#000', ...style }}
        >
            <InternalText size="xl" weight="bold" ref={textRef}></InternalText>
        </InternalFlex>
    );
};
