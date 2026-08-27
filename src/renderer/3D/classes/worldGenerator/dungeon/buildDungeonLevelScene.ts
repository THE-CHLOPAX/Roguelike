import * as THREE from 'three';

import { LevelSceneData } from 'renderer/3D/types';

import { CELL_SIZE_METERS } from '../const';
import { parseWorldGeneratorOutput } from '../utils/parseWorldGeneratorOutput';
import { SceneBuilderCell, WorldGeneratorCellType, WorldGeneratorOutput } from '../types';

const FLOOR_TILE_MATERIAL = new THREE.MeshStandardMaterial({
  color: 0xff0000,
  metalness: 0,
  roughness: 1,
});

export async function buildDungeonLevelScene(
  worldGenOutput: WorldGeneratorOutput
): Promise<LevelSceneData> {
  const cells = parseWorldGeneratorOutput(worldGenOutput);

  const objects: THREE.Object3D[] = [];

  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  objects.push(ambientLight);

  const tileVectors = cells.flatMap((cell) => cell.tileVectors);

  const floorGeometry = new THREE.PlaneGeometry(CELL_SIZE_METERS, CELL_SIZE_METERS);
  const floorInstancedMesh = new THREE.InstancedMesh(
    floorGeometry,
    FLOOR_TILE_MATERIAL,
    tileVectors.length
  );
  floorInstancedMesh.name = 'floor-instanced-mesh';

  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
  const scale = new THREE.Vector3(1, 1, 1);
  const tileSize = new THREE.Vector3(CELL_SIZE_METERS, 0.1, CELL_SIZE_METERS);

  const floorTiles: LevelSceneData['floorTiles'] = tileVectors.map((tileVector, index) => {
    const position = new THREE.Vector3(tileVector.x, 0, tileVector.z);
    matrix.compose(position, quaternion, scale);
    floorInstancedMesh.setMatrixAt(index, matrix);

    return { position, size: tileSize };
  });

  floorInstancedMesh.instanceMatrix.needsUpdate = true;

  cells.forEach((cell) => buildCellByType(cell, objects));

  return {
    floorGroup: floorInstancedMesh,
    floorTiles,
    objects,
  };
}

function buildCellByType(cell: SceneBuilderCell, objects: THREE.Object3D[]): void {
  switch (cell.type) {
    case WorldGeneratorCellType.SPAWN_AREA: {
      const playerSpawner = new THREE.Object3D();

      const { x, z } = cell.center;

      playerSpawner.position.set(x, 0, z);
      playerSpawner.name = 'player-spawner';

      objects.push(playerSpawner);
      break;
    }
  }
}
