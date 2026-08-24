import styled from 'styled-components';
import { useEffect, useRef } from 'react';

import { WorldGeneratorCellType, WorldGeneratorOutput } from '3D/classes/worldGenerator/types';
import { WORLD_GEN_CELL_COLORS, MOCK_WORLD_GEN_OUTPUT } from '3D/classes/worldGenerator/const';

import { BackToViewLayout } from '../layouts/BackToViewLayout';

const CELL_PIXEL_SIZE = 8;

function cellTypeToCssColor(type: WorldGeneratorCellType): string {
  return `#${WORLD_GEN_CELL_COLORS[type].toString(16).padStart(3, '0')}`;
}

function WorldGenGrid({ output }: { output: WorldGeneratorOutput }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    output.data.forEach((cellType, index) => {
      const col = index % output.width;
      const row = Math.floor(index / output.width);

      ctx.fillStyle = cellTypeToCssColor(cellType);
      ctx.fillRect(col * CELL_PIXEL_SIZE, row * CELL_PIXEL_SIZE, CELL_PIXEL_SIZE, CELL_PIXEL_SIZE);
    });
  }, [output]);

  return (
    <StyledCanvas
      ref={canvasRef}
      width={output.width * CELL_PIXEL_SIZE}
      height={output.height * CELL_PIXEL_SIZE}
    />
  );
}

export function WorldGenTestView() {
  return (
    <BackToViewLayout backToView="MenuView">
      <StyledWrapper>
        <WorldGenGrid output={MOCK_WORLD_GEN_OUTPUT} />
      </StyledWrapper>
    </BackToViewLayout>
  );
}

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background: #111;
`;

const StyledCanvas = styled.canvas`
  image-rendering: pixelated;
`;
