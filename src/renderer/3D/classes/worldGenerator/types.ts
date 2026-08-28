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
  tileVectors: Array<SceneBuilderTileVector>;
  type: WorldGeneratorCellType;
};

export type WorldGeneratorVec2 = {
  x: number;
  z: number;
};

export type SceneBuilderTileVector = {
  position: WorldGeneratorVec2;
  edges: WorldGeneratorVec2[];
};

export type SceneBuilderData = Array<SceneBuilderCell>;

export type WorldGenerator = () => Promise<WorldGeneratorOutput>;
