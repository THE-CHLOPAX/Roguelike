import { WorldGeneratorVec2 } from '../types';
import { edgeDirectionKey } from './edgeDirectionKey';
import { VISIBLE_FLOOR_EDGE_DIRECTIONS } from '../const';

const VISIBLE_FLOOR_EDGE_DIRECTION_KEYS = new Set(
  VISIBLE_FLOOR_EDGE_DIRECTIONS.map(edgeDirectionKey)
);

export function isVisibleFloorEdge(edge: WorldGeneratorVec2): boolean {
  return VISIBLE_FLOOR_EDGE_DIRECTION_KEYS.has(edgeDirectionKey(edge));
}
