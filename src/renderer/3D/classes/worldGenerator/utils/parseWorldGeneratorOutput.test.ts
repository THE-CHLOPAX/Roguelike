import { describe, it, expect, vi } from 'vitest';

import { CELL_SIZE_METERS } from '../const';
import { parseWorldGeneratorOutput } from './parseWorldGeneratorOutput';
import { WorldGeneratorCellType, WorldGeneratorOutput, SceneBuilderCell } from '../types';

vi.mock('electron', () => ({
  ipcRenderer: { send: vi.fn(), on: vi.fn(), removeListener: vi.fn(), once: vi.fn() },
}));

const { EMPTY: E, CORRIDOR: C, FIGHT_AREA: F, SPAWN_AREA: S } = WorldGeneratorCellType;

// tileVectors hold absolute, CELL_SIZE_METERS-scaled world positions. This scales a raw
// grid (x, z) the same way, so expectations can be written in raw grid coordinates.
function scaled(x: number, z: number): string {
  return `${x * CELL_SIZE_METERS},${z * CELL_SIZE_METERS}`;
}

function absoluteTiles(cell: SceneBuilderCell): string[] {
  return cell.tileVectors.map((tv) => `${tv.x},${tv.z}`).sort();
}

describe('parseWorldGeneratorOutput', () => {
  describe('area detection via neighbour adjacency', () => {
    it('merges cells connected only diagonally into a single area', () => {
      const output: WorldGeneratorOutput = {
        width: 4,
        height: 4,
        data: [C, E, E, E, E, C, E, E, E, E, E, E, E, E, E, E],
      };

      const result = parseWorldGeneratorOutput(output);

      expect(result).toHaveLength(1);
      expect(result[0].tileVectors).toHaveLength(2);
    });

    it('keeps two same-type areas separate when no path of neighbours connects them', () => {
      const output: WorldGeneratorOutput = {
        width: 5,
        height: 1,
        data: [C, C, E, C, C],
      };

      const result = parseWorldGeneratorOutput(output);

      expect(result).toHaveLength(2);
      expect(result.every((area) => area.tileVectors.length === 2)).toBe(true);
    });

    it('does not merge adjacent cells of different types into one area', () => {
      const output: WorldGeneratorOutput = {
        width: 4,
        height: 1,
        data: [C, C, F, F],
      };

      const result = parseWorldGeneratorOutput(output);

      expect(result).toHaveLength(2);
      const corridor = result.find((area) => area.type === C);
      const fightArea = result.find((area) => area.type === F);
      expect(corridor?.tileVectors).toHaveLength(2);
      expect(fightArea?.tileVectors).toHaveLength(2);
    });

    it('excludes EMPTY cells from every area', () => {
      const output: WorldGeneratorOutput = {
        width: 3,
        height: 3,
        data: [E, E, E, E, S, E, E, E, E],
      };

      const result = parseWorldGeneratorOutput(output);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(S);
      expect(result[0].tileVectors).toHaveLength(1);
    });

    it('returns no areas for an all-EMPTY grid', () => {
      const output: WorldGeneratorOutput = {
        width: 3,
        height: 3,
        data: [E, E, E, E, E, E, E, E, E],
      };

      expect(parseWorldGeneratorOutput(output)).toEqual([]);
    });
  });

  describe('area center', () => {
    it('centers a single-tile area on that tile, scaled by CELL_SIZE_METERS', () => {
      const output: WorldGeneratorOutput = {
        width: 6,
        height: 6,
        data: new Array(36).fill(E),
      };
      output.data[6 * 3 + 2] = C; // x=2, z=3

      const [result] = parseWorldGeneratorOutput(output);

      expect(result.center).toEqual({ x: 2 * CELL_SIZE_METERS, z: 3 * CELL_SIZE_METERS });
      expect(result.tileVectors).toEqual([{ x: 2 * CELL_SIZE_METERS, z: 3 * CELL_SIZE_METERS }]);
    });

    it('centers a rectangular area on the midpoint between its first and last tile', () => {
      // 2 wide x 3 tall block starting at (1,1).
      const output: WorldGeneratorOutput = {
        width: 5,
        height: 5,
        data: [E, E, E, E, E, E, C, C, E, E, E, C, C, E, E, E, C, C, E, E, E, E, E, E, E],
      };

      const [result] = parseWorldGeneratorOutput(output);

      // Tile centers span x:[1,2] and z:[1,3], so the true midpoint is (1.5, 2) - not
      // (2, 2.5), which would double-count half a cell of edge padding.
      expect(result.center).toEqual({ x: 1.5 * CELL_SIZE_METERS, z: 2 * CELL_SIZE_METERS });
      expect(absoluteTiles(result)).toEqual(
        [
          scaled(1, 1),
          scaled(1, 2),
          scaled(1, 3),
          scaled(2, 1),
          scaled(2, 2),
          scaled(2, 3),
        ].sort()
      );
    });
  });

  describe('rectangular and non-rectangular shapes', () => {
    it('captures every tile of a solid rectangular area with no gaps', () => {
      const output: WorldGeneratorOutput = {
        width: 4,
        height: 4,
        data: [F, F, E, E, F, F, E, E, E, E, E, E, E, E, E, E],
      };

      const [result] = parseWorldGeneratorOutput(output);

      expect(result.tileVectors).toHaveLength(4);
      expect(absoluteTiles(result)).toEqual(
        [scaled(0, 0), scaled(0, 1), scaled(1, 0), scaled(1, 1)].sort()
      );
    });

    it('captures the exact footprint of an L-shaped area, with no extra tiles', () => {
      const output: WorldGeneratorOutput = {
        width: 5,
        height: 5,
        data: [C, C, E, E, E, C, E, E, E, E, C, E, E, E, E, C, C, C, E, E, E, E, E, E, E],
      };

      const [result] = parseWorldGeneratorOutput(output);
      const expectedCells = [
        scaled(0, 0),
        scaled(1, 0),
        scaled(0, 1),
        scaled(0, 2),
        scaled(0, 3),
        scaled(1, 3),
        scaled(2, 3),
      ].sort();

      expect(result.tileVectors).toHaveLength(expectedCells.length);
      expect(absoluteTiles(result)).toEqual(expectedCells);
    });
  });
});
