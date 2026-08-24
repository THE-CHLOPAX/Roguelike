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
