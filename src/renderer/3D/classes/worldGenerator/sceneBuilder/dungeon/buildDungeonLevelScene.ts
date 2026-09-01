import { Scene } from '@tgdf';
import * as THREE from 'three';

import { MODELS } from 'renderer/3D/constants';

import { buildSpawner } from './buildSpawner';
import { buildWallGroup } from '../buildWallGroup';
import { MOCK_WORLD_GEN_OUTPUT } from '../../const';
import { buildFloorGroup } from '../buildFloorGroup';
import { buildWallDecorations } from './buildWallDecorations';
import { parseWorldGeneratorOutput } from '../../utils/parseWorldGeneratorOutput';

const DUNGEON_FLOOR_HEIGHT_ARBITRARY = 0.8;

export async function buildDungeonLevelScene(scene: Scene): Promise<void> {
  // STEP 1: World generation
  const worldGenOutput = MOCK_WORLD_GEN_OUTPUT; // TODO: Replace with real world gen when ready

  // STEP 2: World data parsing
  const parsedData = parseWorldGeneratorOutput(worldGenOutput);

  // Lighting - the floor/wall/decoration materials are MeshStandardMaterial (PBR),
  // which render pure black with no light in the scene.
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  // STEP 3: Build base floor instanced meshes
  const floorGroup = buildFloorGroup(scene, parsedData, MODELS.DUNGEON_FLOOR);
  floorGroup.position.y -= DUNGEON_FLOOR_HEIGHT_ARBITRARY;

  randomRotateFloorTiles(floorGroup);

  // STEP 4: Build base walls instanced meshes
  buildWallGroup(scene, parsedData, MODELS.DUNGEON_WALL_BRICK_TALL);

  // STEP 5: Add dungeon-specific wall decorations (plinths, pillars)
  buildWallDecorations(scene, parsedData, MODELS.DUNGEON_PLINTH, MODELS.DUNGEON_PILLAR);

  // STEP 6: Add spawner
  buildSpawner(scene, parsedData);

  // FINAL: NavMesh initialization
  await scene.initializeNavMeshManager(floorGroup);
  return Promise.resolve();
}

function randomRotateFloorTiles(floorGroup: THREE.Group): void {
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const existingQuaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();

  floorGroup.children.forEach((child) => {
    if (!(child instanceof THREE.InstancedMesh)) return;

    for (let index = 0; index < child.count; index++) {
      child.getMatrixAt(index, matrix);
      matrix.decompose(position, existingQuaternion, scale);

      const quaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(-Math.PI / 2, 0, getRandomTileRotation())
      );
      matrix.compose(position, quaternion, scale);
      child.setMatrixAt(index, matrix);
    }

    child.instanceMatrix.needsUpdate = true;
  });
}

function getRandomTileRotation(): number {
  const randomIndex = Math.floor(Math.random() * 4);
  const randomRotations = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
  return randomRotations[randomIndex];
}
