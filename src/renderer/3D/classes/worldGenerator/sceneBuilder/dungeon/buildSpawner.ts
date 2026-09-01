import { Scene } from '@tgdf';
import * as THREE from 'three';

import { SPAWNER_IDS } from 'renderer/3D/constants';

import { SceneBuilderCell, WorldGeneratorCellType } from '../../types';

export function buildSpawner(scene: Scene, parsedData: SceneBuilderCell[]): void {
  parsedData.forEach((cell) => {
    if (cell.type !== WorldGeneratorCellType.SPAWN_AREA) return;

    const playerSpawner = new THREE.Object3D();

    const { x, z } = cell.center;

    playerSpawner.position.set(x, 0, z);
    playerSpawner.name = SPAWNER_IDS.PLAYER;

    scene.add(playerSpawner);
  });
}
