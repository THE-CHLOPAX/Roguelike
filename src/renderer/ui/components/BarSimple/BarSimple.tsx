import styled from 'styled-components';

import barSimpleFrame from '../../../assets/svg/bar-simple.svg?url';

const SCALE = 3;

const NATIVE_WIDTH = 138;
const NATIVE_HEIGHT = 6;

// The frame's 1px border on every side, in native pixels.
const FILL_NATIVE_LEFT = 1;
const FILL_NATIVE_TOP = 1;
const FILL_NATIVE_WIDTH = NATIVE_WIDTH - FILL_NATIVE_LEFT * 2;
const FILL_NATIVE_HEIGHT = NATIVE_HEIGHT - FILL_NATIVE_TOP * 2;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export type BarSimpleProps = {
  progress: number;
  fillColor: string;
  className?: string;
};

export const BarSimple = ({ progress, fillColor, className }: BarSimpleProps) => {
  const clampedProgress = clamp(progress, 0, 1);

  return (
    <Wrapper className={className}>
      <Fill $progress={clampedProgress} $color={fillColor} />
      <Frame />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
  width: ${NATIVE_WIDTH * SCALE}px;
  height: ${NATIVE_HEIGHT * SCALE}px;
`;

const Fill = styled.div<{ $progress: number; $color: string }>`
  position: absolute;
  left: ${FILL_NATIVE_LEFT * SCALE}px;
  top: ${FILL_NATIVE_TOP * SCALE}px;
  width: ${({ $progress }) => FILL_NATIVE_WIDTH * SCALE * $progress}px;
  height: ${FILL_NATIVE_HEIGHT * SCALE}px;
  background: ${({ $color }) => $color};
  border-top: ${SCALE}px solid rgba(255, 255, 255, 0.3);
  border-bottom: ${SCALE}px solid rgba(0, 0, 0, 0.15);
`;

const Frame = styled.div`
  position: absolute;
  inset: 0;
  background-image: url(${barSimpleFrame});
  background-repeat: no-repeat;
  background-size: 100% 100%;
  image-rendering: pixelated;
  pointer-events: none;
`;
