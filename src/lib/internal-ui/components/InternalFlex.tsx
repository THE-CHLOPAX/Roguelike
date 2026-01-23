import { ReactNode, CSSProperties, forwardRef} from 'react';

type InternalFlexProps = {
    children: ReactNode;
    direction?: 'row' | 'column';
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
    gap?: string | number;
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
    style?: CSSProperties;
    className?: string;
};

export const InternalFlex = forwardRef<HTMLDivElement, InternalFlexProps>(
    ({ 
        children,
        direction = 'row',
        align = 'start',
        justify = 'start',
        gap = 0,
        wrap = 'nowrap',
        style,
        className
    }, ref) => {
        const alignMap = {
            start: 'flex-start',
            center: 'center',
            end: 'flex-end',
            stretch: 'stretch'
        };

        const justifyMap = {
            start: 'flex-start',
            center: 'center',
            end: 'flex-end',
            between: 'space-between',
            around: 'space-around'
        };

        return (
            <div 
                ref={ref}
                className={className}
                style={{
                    display: 'flex',
                    flexDirection: direction,
                    alignItems: alignMap[align],
                    justifyContent: justifyMap[justify],
                    gap: typeof gap === 'number' ? `${gap}px` : gap,
                    flexWrap: wrap,
                    ...style
                }}
            >
                {children}
            </div>
        );
    }
);

InternalFlex.displayName = 'InternalFlex';