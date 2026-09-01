import * as THREE from 'three';

import { CELL_SIZE_METERS } from '../const';
import { SceneBuilderCellTile, WorldGeneratorVec2 } from '../types';

export function getWallPositionOnTile(
  tile: SceneBuilderCellTile,
  edge: WorldGeneratorVec2
): THREE.Vector3 {
  return new THREE.Vector3(
    tile.position.x + (edge.x * CELL_SIZE_METERS) / 2,
    0,
    tile.position.z + (edge.z * CELL_SIZE_METERS) / 2
  );
}
