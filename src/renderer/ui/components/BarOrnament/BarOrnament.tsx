import styled from 'styled-components';

import barOrnamentFrame from '../../../assets/svg/bar-ornament.svg?url';

const SCALE = 3;

const NATIVE_WIDTH = 189;
const NATIVE_HEIGHT = 16;

// The hollow track between the frame's two horizontal border lines and its
// end caps, measured directly from the svg's painted pixels.
const FILL_NATIVE_LEFT = 3;
const FILL_NATIVE_TOP = 6;
const FILL_NATIVE_WIDTH = 181;
const FILL_NATIVE_HEIGHT = 4;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export type BarOrnamentProps = {
  progress: number;
  fillColor: string;
  className?: string;
};

export const BarOrnament = ({ progress, fillColor, className }: BarOrnamentProps) => {
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
  background-image: url(${barOrnamentFrame});
  background-repeat: no-repeat;
  background-size: 100% 100%;
  image-rendering: pixelated;
  pointer-events: none;
`;
