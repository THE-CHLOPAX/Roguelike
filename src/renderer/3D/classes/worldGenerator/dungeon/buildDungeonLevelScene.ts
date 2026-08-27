import * as THREE from 'three';

import { LevelSceneData } from 'renderer/3D/types';

import { CELL_SIZE_METERS } from '../const';
import { parseWorldGeneratorOutput } from '../utils/parseWorldGeneratorOutput';
import { SceneBuilderCell, WorldGeneratorCellType, WorldGeneratorOutput } from '../types';

// Placeholder floor tile appearance until real dungeon floor materials/textures are wired in.
const FLOOR_TILE_MATERIAL = new THREE.MeshStandardMaterial({ color: 0xff0000 });

export async function buildDungeonLevelScene(
  worldGenOutput: WorldGeneratorOutput
): Promise<LevelSceneData> {
  const cells = parseWorldGeneratorOutput(worldGenOutput);

  const floorGroup = new THREE.Group();
  floorGroup.name = 'floor-group';

  const objects: THREE.Object3D[] = [];

  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  objects.push(ambientLight);

  cells.forEach((cell) => {
    cell.tileVectors.forEach((tileVector) => {
      const floorTile = new THREE.Mesh(
        new THREE.PlaneGeometry(CELL_SIZE_METERS, CELL_SIZE_METERS),
        FLOOR_TILE_MATERIAL
      );
      floorTile.rotation.x = -Math.PI / 2;
      floorTile.position.set(tileVector.x, 0, tileVector.z);

      floorGroup.add(floorTile);
    });

    buildCellByType(cell, objects);
  });

  return {
    floorGroup,
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
