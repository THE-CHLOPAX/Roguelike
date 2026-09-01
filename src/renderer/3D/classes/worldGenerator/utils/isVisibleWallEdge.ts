import { WorldGeneratorVec2 } from '../types';
import { edgeDirectionKey } from './edgeDirectionKey';
import { VISIBLE_WALL_EDGE_DIRECTIONS } from '../const';

const VISIBLE_WALL_EDGE_DIRECTION_KEYS = new Set(
  VISIBLE_WALL_EDGE_DIRECTIONS.map(edgeDirectionKey)
);

export function isVisibleWallEdge(edge: WorldGeneratorVec2): boolean {
  return VISIBLE_WALL_EDGE_DIRECTION_KEYS.has(edgeDirectionKey(edge));
}
