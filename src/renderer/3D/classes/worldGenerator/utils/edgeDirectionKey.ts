import { WorldGeneratorVec2 } from '../types';

export function edgeDirectionKey(edge: WorldGeneratorVec2): string {
  return `${edge.x},${edge.z}`;
}
