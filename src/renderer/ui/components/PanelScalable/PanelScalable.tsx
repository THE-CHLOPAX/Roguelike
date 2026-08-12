import type { CSSProperties, ReactNode } from 'react';

import styled from 'styled-components';

import { COLORS } from '../../../constants';
import scalablePanelTop from '../../../assets/svg/scalable-panel-top.svg?url';
import scalablePanelLeft from '../../../assets/svg/scalable-panel-left.svg?url';
import scalablePanelRight from '../../../assets/svg/scalable-panel-right.svg?url';
import scalablePanelBottom from '../../../assets/svg/scalable-panel-bottom.svg?url';
import scalablePanelTopLeft from '../../../assets/svg/scalable-panel-top-left.svg?url';
import scalablePanelTopRight from '../../../assets/svg/scalable-panel-top-right.svg?url';
import scalablePanelBottomLeft from '../../../assets/svg/scalable-panel-bottom-left.svg?url';
import scalablePanelBottomRight from '../../../assets/svg/scalable-panel-bottom-right.svg?url';

const SCALE = 3;

// Native corner sizes — these stay pixel-perfect and never stretch.
const CORNER_WIDTH_LEFT = 15;
const CORNER_WIDTH_RIGHT = 16;
const CORNER_HEIGHT_TOP = 17;
const CORNER_HEIGHT_BOTTOM = 13;
const EDGE_THICKNESS = 1;

const MIN_WIDTH = 20;
const MIN_HEIGHT = 20;

export type PanelScalableProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export const PanelScalable = ({ children, className, style }: PanelScalableProps) => {
  return (
    <Wrapper className={className} style={style}>
      <SegmentTopLeft />
      <SegmentTop />
      <SegmentTopRight />
      <SegmentLeft />
      <SegmentRight />
      <SegmentBottomLeft />
      <SegmentBottom />
      <SegmentBottomRight />
      <Content>{children}</Content>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
  display: inline-grid;
  min-width: ${MIN_WIDTH * SCALE}px;
  min-height: ${MIN_HEIGHT * SCALE}px;
`;

const Content = styled.div`
  position: relative;
  box-sizing: border-box;
  background: ${COLORS.BG_COLOR};
  padding: ${6 * SCALE}px;
  min-width: 100%;
  min-height: 100%;
  width: fit-content;
  height: fit-content;
  clip-path: inset(${1 * SCALE}px);
`;

const Segment = styled.div`
  position: absolute;
  image-rendering: pixelated;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  pointer-events: none;
  z-index: 1;
`;

const SegmentTopLeft = styled(Segment)`
  top: 0;
  left: 0;
  width: ${CORNER_WIDTH_LEFT * SCALE}px;
  height: ${CORNER_HEIGHT_TOP * SCALE}px;
  background-image: url(${scalablePanelTopLeft});
`;

const SegmentTopRight = styled(Segment)`
  top: 0;
  right: 0;
  width: ${CORNER_WIDTH_RIGHT * SCALE}px;
  height: ${CORNER_HEIGHT_TOP * SCALE}px;
  background-image: url(${scalablePanelTopRight});
`;

const SegmentBottomLeft = styled(Segment)`
  bottom: 0;
  left: 0;
  width: ${CORNER_WIDTH_LEFT * SCALE}px;
  height: ${CORNER_HEIGHT_BOTTOM * SCALE}px;
  background-image: url(${scalablePanelBottomLeft});
`;

const SegmentBottomRight = styled(Segment)`
  bottom: 0;
  right: 0;
  width: ${CORNER_WIDTH_RIGHT * SCALE}px;
  height: ${CORNER_HEIGHT_BOTTOM * SCALE}px;
  background-image: url(${scalablePanelBottomRight});
`;

const SegmentTop = styled(Segment)`
  top: 0;
  left: ${CORNER_WIDTH_LEFT * SCALE}px;
  right: ${CORNER_WIDTH_RIGHT * SCALE}px;
  height: ${EDGE_THICKNESS * SCALE}px;
  background-image: url(${scalablePanelTop});
`;

const SegmentBottom = styled(Segment)`
  bottom: 0;
  left: ${CORNER_WIDTH_LEFT * SCALE}px;
  right: ${CORNER_WIDTH_RIGHT * SCALE}px;
  height: ${EDGE_THICKNESS * SCALE}px;
  background-image: url(${scalablePanelBottom});
`;

const SegmentLeft = styled(Segment)`
  left: 0;
  top: ${CORNER_HEIGHT_TOP * SCALE}px;
  bottom: ${CORNER_HEIGHT_BOTTOM * SCALE}px;
  width: ${EDGE_THICKNESS * SCALE}px;
  background-image: url(${scalablePanelLeft});
`;

const SegmentRight = styled(Segment)`
  right: 0;
  top: ${CORNER_HEIGHT_TOP * SCALE}px;
  bottom: ${CORNER_HEIGHT_BOTTOM * SCALE}px;
  width: ${EDGE_THICKNESS * SCALE}px;
  background-image: url(${scalablePanelRight});
`;
