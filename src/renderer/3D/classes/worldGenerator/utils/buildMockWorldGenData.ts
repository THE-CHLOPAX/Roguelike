import { WorldGeneratorCellType } from '../types';

export const MOCK_WORLD_GEN_WIDTH = 64;
export const MOCK_WORLD_GEN_HEIGHT = 64;

export function buildMockWorldGenData(): WorldGeneratorCellType[] {
  const data = new Array<WorldGeneratorCellType>(MOCK_WORLD_GEN_WIDTH * MOCK_WORLD_GEN_HEIGHT).fill(
    WorldGeneratorCellType.EMPTY
  );

  const setRect = (
    colStart: number,
    rowStart: number,
    width: number,
    height: number,
    type: WorldGeneratorCellType
  ) => {
    for (let row = rowStart; row < rowStart + height; row++) {
      for (let col = colStart; col < colStart + width; col++) {
        data[row * MOCK_WORLD_GEN_WIDTH + col] = type;
      }
    }
  };

  // Level end room (top).
  setRect(30, 6, 6, 6, WorldGeneratorCellType.LEVEL_END);
  setRect(32, 12, 2, 4, WorldGeneratorCellType.CORRIDOR);

  // Fight area, branching left/right into treasure rooms.
  setRect(30, 16, 6, 6, WorldGeneratorCellType.FIGHT_AREA);
  setRect(28, 18, 2, 2, WorldGeneratorCellType.CORRIDOR);
  setRect(24, 17, 4, 4, WorldGeneratorCellType.TREASURE_AREA);
  setRect(36, 18, 2, 2, WorldGeneratorCellType.CORRIDOR);
  setRect(38, 17, 4, 4, WorldGeneratorCellType.TREASURE_AREA);

  // Down to the spawn area.
  setRect(32, 22, 2, 6, WorldGeneratorCellType.CORRIDOR);
  setRect(31, 28, 4, 4, WorldGeneratorCellType.SPAWN_AREA);

  // Down to the final treasure room.
  setRect(32, 32, 2, 5, WorldGeneratorCellType.CORRIDOR);
  setRect(31, 37, 4, 4, WorldGeneratorCellType.TREASURE_AREA);

  return data;
}
