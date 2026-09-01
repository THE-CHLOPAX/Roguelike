export enum WorldGeneratorCellType {
  EMPTY,
  CORRIDOR,
  FIGHT_AREA,
  LEVEL_END,
  SPAWN_AREA,
  TREASURE_AREA,
}

export type WorldGeneratorOutput = {
  width: number;
  height: number;
  data: Array<WorldGeneratorCellType>;
};

export type SceneBuilderCell = {
  center: WorldGeneratorVec2;
  cellTiles: Array<SceneBuilderCellTile>;
  type: WorldGeneratorCellType;
};

export type WorldGeneratorVec2 = {
  x: number;
  z: number;
};

export type SceneBuilderCellTile = {
  position: WorldGeneratorVec2;
  edges: WorldGeneratorVec2[];
};

export type WorldGenerator = () => Promise<WorldGeneratorOutput>;
