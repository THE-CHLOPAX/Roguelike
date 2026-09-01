import * as THREE from 'three';
import { arrayShallowIncludes, assert, getModelFromStore, isMesh, ModelRecord, Scene } from '@tgdf';

import { CELL_SIZE_METERS, TILE_SCALE_FACTOR } from '../const';
import { getWallPositionOnTile } from '../utils/getWallPositionOnTile';
import { pixelateModelMaterial } from '../utils/pixelateModelMaterial';
import { RigidStaticObject } from '../../gameObjects/RigidStaticObject';
import { SceneBuilderCell, SceneBuilderCellTile, WorldGeneratorVec2 } from '../types';

type WallPlacement = {
  tile: SceneBuilderCellTile;
  edge: WorldGeneratorVec2;
};

const WALL_GROUP_NAME = 'level-wall-group';

const VISIBLE_WALL_EDGE_DIRECTIONS: WorldGeneratorVec2[] = [
  { x: -1, z: 0 },
  { x: 0, z: -1 },
];

const WALL_YAW_BY_EDGE_DIRECTION: Record<string, number> = {
  '0,-1': 0,
  '-1,0': Math.PI / 2,
  '0,1': Math.PI,
  '1,0': Math.PI * 1.5,
};

export function buildWallGroup(
  scene: Scene,
  parsedData: SceneBuilderCell[],
  wallModelRecord: ModelRecord
): THREE.Group {
  const meshGroup = new THREE.Group();
  meshGroup.name = WALL_GROUP_NAME;

  const wallModel = getModelFromStore(wallModelRecord.id);
  const wallMesh = wallModel?.children[0];

  assert(isMesh(wallMesh));

  const wallGeometry = wallMesh.geometry;
  const wallMaterial = wallMesh.material;
  pixelateModelMaterial(wallMaterial);

  parsedData.forEach((cell) => {
    const { cellTiles } = cell;

    // Wall models
    const wallPlacements: WallPlacement[] = cellTiles.flatMap((tile) =>
      tile.edges
        .map((edge) => ({ tile, edge }))
        .filter((cP) => arrayShallowIncludes(VISIBLE_WALL_EDGE_DIRECTIONS, cP.edge))
    );

    const instancedMesh = new THREE.InstancedMesh(
      wallGeometry,
      wallMaterial,
      wallPlacements.length
    );

    const matrix = new THREE.Matrix4();
    const scale = new THREE.Vector3(TILE_SCALE_FACTOR, TILE_SCALE_FACTOR, TILE_SCALE_FACTOR);

    wallPlacements.forEach(({ tile, edge }, index) => {
      const position = getWallPositionOnTile(tile, edge);
      const yaw = WALL_YAW_BY_EDGE_DIRECTION[`${edge.x},${edge.z}`] ?? 0;

      const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, yaw));
      matrix.compose(position, quaternion, scale);
      instancedMesh.setMatrixAt(index, matrix);
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    meshGroup.add(instancedMesh);

    // Wall colliders
    const colliderPlacements = cellTiles.flatMap((tile) =>
      tile.edges.map((edge) => ({ tile, edge }))
    );
    colliderPlacements.forEach(({ tile, edge }) => {
      const position = getWallPositionOnTile(tile, edge);
      const size = new THREE.Vector3(CELL_SIZE_METERS, CELL_SIZE_METERS, 0.1);
      const rigidWallObject = new RigidStaticObject(scene, { position, size });
      const yaw = WALL_YAW_BY_EDGE_DIRECTION[`${edge.x},${edge.z}`] ?? 0;

      rigidWallObject.rotateOnAxis(new THREE.Vector3(0, 1, 0), yaw);
      rigidWallObject.position.y += CELL_SIZE_METERS / 2;

      scene.add(rigidWallObject);
    });
  });

  scene.add(meshGroup);

  return meshGroup;
}
