import type { CSSProperties, ReactNode } from 'react';

import styled from 'styled-components';

import { COLORS } from '../../../constants';

const FONT_SIZES = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

type TextSize = keyof typeof FONT_SIZES;

type TextProps = {
  children: ReactNode;
  size?: TextSize;
  color?: string;
  className?: string;
  nowrap?: boolean;
  style?: CSSProperties;
};

export const Text = ({
  children,
  size = 'md',
  color = COLORS.FONT_COLOR_PRIMARY,
  nowrap = false,
  className,
  style,
}: TextProps) => (
  <StyledText $size={size} $color={color} $nowrap={nowrap} className={className} style={style}>
    {children}
  </StyledText>
);

const StyledText = styled.span<{ $size: TextSize; $color: string; $nowrap: boolean }>`
  font-family: 'Alagard', monospace;
  font-size: ${({ $size }) => FONT_SIZES[$size]}px;
  line-height: 0.8;
  color: ${({ $color }) => $color};
  white-space: ${({ $nowrap }) => ($nowrap ? 'nowrap' : 'initial')};
`;
