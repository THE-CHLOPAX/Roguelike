import * as React from 'react';

type InternalTextProps = {
    children?: React.ReactNode;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
    align?: 'left' | 'center' | 'right';
    color?: string;
    style?: React.CSSProperties;
    className?: string;
};

export const InternalText = React.forwardRef<HTMLSpanElement, InternalTextProps>(function InternalText({ 
    children,
    size = 'md',
    weight = 'regular',
    align = 'left',
    color,
    style,
    className
}, ref) {
    const sizeMap = {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem'
    };

    const weightMap = {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700
    };

    return (
        <span 
            ref={ref}
            className={className}
            style={{
                fontSize: sizeMap[size],
                fontWeight: weightMap[weight],
                textAlign: align,
                color,
                ...style
            }}
        >
            {children}
        </span>
    );
});
