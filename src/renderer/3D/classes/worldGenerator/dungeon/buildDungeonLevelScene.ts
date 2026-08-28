import * as THREE from 'three';
import { arrayShallowIncludes, assert, getModelFromStore, isMesh, Scene } from '@tgdf';

import { LevelSceneData } from 'renderer/3D/types';
import { MODELS, SPAWNER_IDS } from 'renderer/3D/constants';

import { CELL_SIZE_METERS } from '../const';
import { getTopFaceGeometry } from './getTopFaceGeometry';
import { pixelateTexture } from '../../../utils/pixelateTexture';
import { RigidFloorObject } from '../../gameObjects/RigidFloorObject';
import { parseWorldGeneratorOutput } from '../utils/parseWorldGeneratorOutput';
import {
  SceneBuilderCell,
  SceneBuilderTileVector,
  WorldGeneratorCellType,
  WorldGeneratorOutput,
  WorldGeneratorVec2,
} from '../types';

const TILE_TOP_FACE_REFERENCE_QUATERNION = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(-Math.PI / 2, 0, 0)
);

const VISIBLE_EDGE_DIRECTIONS: WorldGeneratorVec2[] = [
  { x: 1, z: 0 },
  { x: 0, z: 1 },
];

export async function buildDungeonLevelScene(
  scene: Scene,
  worldGenOutput: WorldGeneratorOutput
): Promise<LevelSceneData> {
  const cells = parseWorldGeneratorOutput(worldGenOutput);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  cells.forEach((cell) => buildCellByType(cell, scene));

  const floorGroup = buildFloor(cells, scene);

  return { floorMesh: floorGroup };
}

function buildCellByType(cell: SceneBuilderCell, scene: Scene): void {
  switch (cell.type) {
    case WorldGeneratorCellType.SPAWN_AREA: {
      const playerSpawner = new THREE.Object3D();

      const { x, z } = cell.center;

      playerSpawner.position.set(x, 0, z);
      playerSpawner.name = SPAWNER_IDS.PLAYER;

      scene.add(playerSpawner);
      break;
    }
  }
}

function buildFloor(cells: SceneBuilderCell[], scene: Scene): THREE.Group {
  const floorModel = getModelFromStore(MODELS.DUNGEON_FLOOR.id);
  const floorMesh = floorModel?.children[0];

  assert(isMesh(floorMesh));

  const fullGeometry = floorMesh.geometry;
  const material = floorMesh.material;
  pixelateFloorMaterial(material);

  const topFaceGeometry = getTopFaceGeometry(fullGeometry, TILE_TOP_FACE_REFERENCE_QUATERNION);

  const tileVectors = cells.flatMap((cell) => cell.tileVectors);

  const edgeTiles = tileVectors.filter((tile) =>
    tile.edges.some((edgeDir) => {
      return arrayShallowIncludes(VISIBLE_EDGE_DIRECTIONS, edgeDir);
    })
  );
  const nonEdgeTiles = tileVectors.filter((tile) => edgeTiles.includes(tile) === false);

  const floorGroup = new THREE.Group();
  floorGroup.name = 'floor-instanced-mesh';
  floorGroup.add(
    buildTileInstancedMesh(fullGeometry, material, edgeTiles, scene, 'floor-edge-instanced-mesh')
  );
  floorGroup.add(
    buildTileInstancedMesh(
      topFaceGeometry,
      material,
      nonEdgeTiles,
      scene,
      'floor-inner-instanced-mesh'
    )
  );

  floorGroup.position.y -= 1;
  scene.add(floorGroup);

  return floorGroup;
}

function buildTileInstancedMesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material | THREE.Material[],
  tiles: SceneBuilderTileVector[],
  scene: Scene,
  name: string
): THREE.InstancedMesh {
  const instancedMesh = new THREE.InstancedMesh(geometry, material, tiles.length);
  instancedMesh.name = name;

  const matrix = new THREE.Matrix4();
  const scale = new THREE.Vector3(1, 1, 1);
  const tileSize = new THREE.Vector3(CELL_SIZE_METERS, 0.1, CELL_SIZE_METERS);

  tiles.forEach((tile, index) => {
    const position = new THREE.Vector3(tile.position.x, 0, tile.position.z);
    const randomTileRotation = getRandomTileRotation();

    const quaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(-Math.PI / 2, 0, randomTileRotation)
    );
    matrix.compose(position, quaternion, scale);
    instancedMesh.setMatrixAt(index, matrix);

    const rigidFloorObject = new RigidFloorObject(scene, { position, size: tileSize });
    scene.add(rigidFloorObject);
  });

  instancedMesh.instanceMatrix.needsUpdate = true;

  return instancedMesh;
}

function getRandomTileRotation(): number {
  const randomIndex = Math.floor(Math.random() * 4);
  const randomRotations = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
  return randomRotations[randomIndex];
}

function pixelateFloorMaterial(material: THREE.Material | THREE.Material[]): void {
  const materials = Array.isArray(material) ? material : [material];
  materials.forEach((mat) => {
    if ('map' in mat && mat.map instanceof THREE.Texture) {
      pixelateTexture(mat.map);
    }
  });
}
