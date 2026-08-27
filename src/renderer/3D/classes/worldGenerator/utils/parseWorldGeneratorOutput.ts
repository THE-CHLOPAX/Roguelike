import { assert } from '@tgdf';

import { vec2toIndex } from './vec2ToIndex';
import { indexToVec2 } from './indexToVec2';
import { CELL_SIZE_METERS } from '../const';
import { getNeighbourCellIndexes } from './getNeighbourCellIndexes';
import {
  SceneBuilderData,
  WorldGeneratorCellType,
  WorldGeneratorOutput,
  WorldGeneratorVec2,
} from '../types';

type TypedCellWithNeighbours = {
  type: WorldGeneratorCellType;
  index: number;
  checked: boolean;
  neighbourIndexes: number[];
};

type TypedCellArea = {
  type: WorldGeneratorCellType;
  indexes: number[];
};

export function parseWorldGeneratorOutput(outputRaw: WorldGeneratorOutput): SceneBuilderData {
  const { width, height: depth, data } = outputRaw;

  const typedNonEmptyCellsMap = getTypedCellIndexesWithNeighboursMap(width, depth, data);
  const areas = detectAreasFromNeighbours(typedNonEmptyCellsMap);

  const sceneBuilderData: SceneBuilderData = areas.map((area) => {
    const tileVectors = area.indexes
      .map((i) => {
        const tilePosition = indexToVec2(i, width);

        assert(tilePosition !== null, 'Error while mapping tile vectors');

        const { x, z } = tilePosition;

        return {
          x: x * CELL_SIZE_METERS,
          z: z * CELL_SIZE_METERS,
        };
      })
      .filter((aT): aT is WorldGeneratorVec2 => aT !== null);

    let startX = Infinity;
    let startZ = Infinity;
    let endX = -Infinity;
    let endZ = -Infinity;

    for (const { x, z } of tileVectors) {
      if (x < startX) startX = x;
      if (z < startZ) startZ = z;
      if (x > endX) endX = x;
      if (z > endZ) endZ = z;
    }

    const start = {
      x: startX,
      z: startZ,
    };
    const end = {
      x: endX,
      z: endZ,
    };

    const { type } = area;

    // The center of the tile span is the midpoint between the first and last tile's
    // centers - start.x + (end.x - start.x + 1) / 2 would be off by half a cell.
    const center: WorldGeneratorVec2 = {
      x: (start.x + end.x) / 2,
      z: (start.z + end.z) / 2,
    };

    return {
      center,
      tileVectors,
      type,
    };
  });

  return sceneBuilderData;
}

function getTypedCellIndexesWithNeighboursMap(
  width: number,
  depth: number,
  data: WorldGeneratorCellType[]
): Map<number, TypedCellWithNeighbours> {
  const nonEmptyCellsMap: Map<number, TypedCellWithNeighbours> = new Map();

  // Read output array row by row, from top-left to bottom-right.
  for (let z = 0; z < depth; z++) {
    for (let x = 0; x < width; x++) {
      const index = vec2toIndex(x, z, width);
      const gridCellType = data[index];
      if (gridCellType === WorldGeneratorCellType.EMPTY) continue;

      const neighbourIndexes = getNeighbourCellIndexes(x, z, width, depth).filter(
        (cellIndex) => data[cellIndex] === gridCellType
      );

      const nonEmptyCell: TypedCellWithNeighbours = {
        type: gridCellType,
        index,
        checked: false,
        neighbourIndexes,
      };

      nonEmptyCellsMap.set(index, nonEmptyCell);
    }
  }
  return nonEmptyCellsMap;
}

function detectAreasFromNeighbours(
  cellsMap: Map<number, TypedCellWithNeighbours>
): TypedCellArea[] {
  const areas: TypedCellArea[] = [];

  for (const startCell of cellsMap.values()) {
    if (startCell.checked) continue;

    const areaIndexesSet: Set<number> = new Set();
    const stack: TypedCellWithNeighbours[] = [startCell];

    startCell.checked = true;

    while (stack.length > 0) {
      const cell = stack.pop();

      assert(cell !== undefined);

      areaIndexesSet.add(cell.index);

      for (const neighbourIndex of cell.neighbourIndexes) {
        const neighbour = cellsMap.get(neighbourIndex);
        if (neighbour && !neighbour.checked) {
          neighbour.checked = true;
          stack.push(neighbour);
        }
      }
    }

    areas.push({ type: startCell.type, indexes: Array.from(areaIndexesSet) });
  }

  return areas;
}
