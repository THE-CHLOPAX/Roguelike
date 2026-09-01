import { WorldGeneratorVec2 } from '../types';
import { edgeDirectionKey } from './edgeDirectionKey';

const WALL_YAW_BY_EDGE_DIRECTION: Record<string, number> = {
  '0,-1': 0,
  '-1,0': Math.PI / 2,
  '0,1': Math.PI,
  '1,0': Math.PI * 1.5,
};

export function getWallYawForEdge(edge: WorldGeneratorVec2): number {
  return WALL_YAW_BY_EDGE_DIRECTION[edgeDirectionKey(edge)] ?? 0;
}
