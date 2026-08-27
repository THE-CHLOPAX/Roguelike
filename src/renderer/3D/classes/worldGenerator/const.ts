import { WorldGeneratorCellType, WorldGeneratorOutput } from './types';
import {
  MOCK_WORLD_GEN_WIDTH,
  MOCK_WORLD_GEN_HEIGHT,
  buildMockWorldGenData,
} from './utils/buildMockWorldGenData';

export const WORLD_GEN_CELL_COLORS: Record<WorldGeneratorCellType, number> = {
  [WorldGeneratorCellType.EMPTY]: 0x333,
  [WorldGeneratorCellType.CORRIDOR]: 0x000,
  [WorldGeneratorCellType.FIGHT_AREA]: 0xf00,
  [WorldGeneratorCellType.LEVEL_END]: 0xf0f,
  [WorldGeneratorCellType.SPAWN_AREA]: 0x0f0,
  [WorldGeneratorCellType.TREASURE_AREA]: 0x00f,
};

export const MOCK_WORLD_GEN_OUTPUT: WorldGeneratorOutput = {
  width: MOCK_WORLD_GEN_WIDTH,
  height: MOCK_WORLD_GEN_HEIGHT,
  data: buildMockWorldGenData(),
};

export const CELL_SIZE_METERS = 5;
