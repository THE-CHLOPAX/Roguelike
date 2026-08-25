import styled from 'styled-components';
import { useEffect, useRef } from 'react';

import { WorldGeneratorCellType, WorldGeneratorOutput } from '3D/classes/worldGenerator/types';
import { WORLD_GEN_CELL_COLORS, MOCK_WORLD_GEN_OUTPUT } from '3D/classes/worldGenerator/const';

import { BackToViewLayout } from '../layouts/BackToViewLayout';

const CELL_PIXEL_SIZE = 24;
const GRID_LINE_COLOR = 'rgba(255, 255, 255, 0.15)';
const CELL_LABEL_COLOR = 'rgba(255, 255, 255, 0.85)';
const CELL_LABEL_FONT = '8px monospace';

function cellTypeToCssColor(type: WorldGeneratorCellType): string {
  return `#${WORLD_GEN_CELL_COLORS[type].toString(16).padStart(3, '0')}`;
}

function WorldGenGrid({ output }: { output: WorldGeneratorOutput }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const width = output.width * CELL_PIXEL_SIZE;
    const height = output.height * CELL_PIXEL_SIZE;

    output.data.forEach((cellType, index) => {
      const col = index % output.width;
      const row = Math.floor(index / output.width);

      ctx.fillStyle = cellTypeToCssColor(cellType);
      ctx.fillRect(col * CELL_PIXEL_SIZE, row * CELL_PIXEL_SIZE, CELL_PIXEL_SIZE, CELL_PIXEL_SIZE);
    });

    ctx.strokeStyle = GRID_LINE_COLOR;
    ctx.lineWidth = 1;
    for (let col = 0; col <= output.width; col++) {
      const x = col * CELL_PIXEL_SIZE + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let row = 0; row <= output.height; row++) {
      const y = row * CELL_PIXEL_SIZE + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.fillStyle = CELL_LABEL_COLOR;
    ctx.font = CELL_LABEL_FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    output.data.forEach((_cellType, index) => {
      const col = index % output.width;
      const row = Math.floor(index / output.width);

      ctx.fillText(
        String(index),
        col * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2,
        row * CELL_PIXEL_SIZE + CELL_PIXEL_SIZE / 2
      );
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
  width: 100vw;
  height: 100vh;
  background: #111;
  overflow-x: auto;
  overflow-y: auto;
`;

const StyledCanvas = styled.canvas`
  display: block;
  image-rendering: pixelated;
`;
