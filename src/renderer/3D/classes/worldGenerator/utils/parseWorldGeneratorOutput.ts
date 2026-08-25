import { assert } from '@tgdf';

import { vec2toIndex } from './vec2ToIndex';
import { indexToVec2 } from './indexToVec2';
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
  performance.mark('start');
  const { width, height: depth, data } = outputRaw;

  const typedNonEmptyCellsMap = getTypedCellIndexesWithNeighboursMap(width, depth, data);
  const areas = detectAreasFromNeighbours(typedNonEmptyCellsMap);

  const sceneBuilderData: SceneBuilderData = areas.map((area) => {
    const areaTileVectors = area.indexes
      .map((i) => indexToVec2(i, width))
      .filter((aT): aT is WorldGeneratorVec2 => aT !== null);

    let startX = width;
    let startZ = depth;
    let endX = 0;
    let endZ = 0;

    for (const { x, z } of areaTileVectors) {
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

    // Since we're in XZ coordinates indexed from 0, we need to add 1 to
    // vector subtraction results for actual dimensions.
    const areaDepth = end.z - start.z + 1;
    const areaWidth = end.x - start.x + 1;

    const center: WorldGeneratorVec2 = {
      x: start.x + areaWidth / 2,
      z: start.z + areaDepth / 2,
    };

    // Format area tile vectors to area-local coordinates by subtracting the
    // area center position.
    const tileVectorsLocal = areaTileVectors.map((atv) => ({
      x: atv.x - center.x,
      z: atv.z - center.z,
    }));

    return {
      center,
      tileVectors: tileVectorsLocal,
      type,
    };
  });

  performance.mark('end');
  const measurementId = 'measurement';
  performance.measure(measurementId, 'start', 'end');
  const [measure] = performance.getEntriesByName(measurementId);
  console.log('Measure: ', measure.duration);

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
