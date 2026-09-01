import * as THREE from 'three';
import { arrayShallowIncludes, assert, getModelFromStore, isMesh, ModelRecord, Scene } from '@tgdf';

import { CELL_SIZE_METERS, TILE_SCALE_FACTOR } from '../const';
import { getTopFaceGeometry } from '../utils/getTopFaceGeometry';
import { pixelateModelMaterial } from '../utils/pixelateModelMaterial';
import { RigidStaticObject } from '../../gameObjects/RigidStaticObject';
import { SceneBuilderCell, SceneBuilderCellTile, WorldGeneratorVec2 } from '../types';

const VISIBLE_FLOOR_EDGE_DIRECTIONS: WorldGeneratorVec2[] = [
  { x: 1, z: 0 },
  { x: 0, z: 1 },
];

const TILE_TOP_FACE_REFERENCE_QUATERNION = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(-Math.PI / 2, 0, 0)
);

const FLOOR_GROUP_NAME = 'level-floor-group';

export function buildFloorGroup(
  scene: Scene,
  parsedData: SceneBuilderCell[],
  floorModelRecord: ModelRecord
): THREE.Group {
  const meshGroup = new THREE.Group();
  meshGroup.name = FLOOR_GROUP_NAME;

  // Floor models
  const floorModel = getModelFromStore(floorModelRecord.id);
  const floorMesh = floorModel?.children[0];

  assert(isMesh(floorMesh));

  const fullGeometry = floorMesh.geometry;
  const material = floorMesh.material;
  pixelateModelMaterial(material);

  const topFaceGeometry = getTopFaceGeometry(fullGeometry, TILE_TOP_FACE_REFERENCE_QUATERNION);
  const tileSize = new THREE.Vector3(CELL_SIZE_METERS, 0.1, CELL_SIZE_METERS);

  // One InstancedMesh pair per cell (rather than one pair for the whole level) so
  // Three.js can frustum-cull whole cells that are off-screen.
  parsedData.forEach((cell) => {
    const { cellTiles } = cell;

    const edgeTiles = cellTiles.filter((tile) =>
      tile.edges.some((edgeDir) => {
        return arrayShallowIncludes(VISIBLE_FLOOR_EDGE_DIRECTIONS, edgeDir);
      })
    );
    const nonEdgeTiles = cellTiles.filter((tile) => edgeTiles.includes(tile) === false);

    meshGroup.add(buildTileInstancedMesh(fullGeometry, material, edgeTiles));
    meshGroup.add(buildTileInstancedMesh(topFaceGeometry, material, nonEdgeTiles));

    cellTiles.forEach((tile) => {
      const position = new THREE.Vector3(tile.position.x, 0, tile.position.z);
      const rigidFloorObject = new RigidStaticObject(scene, { position, size: tileSize });
      scene.add(rigidFloorObject);
    });
  });

  scene.add(meshGroup);

  return meshGroup;
}

function buildTileInstancedMesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material | THREE.Material[],
  tiles: SceneBuilderCellTile[]
): THREE.InstancedMesh {
  const instancedMesh = new THREE.InstancedMesh(geometry, material, tiles.length);

  const matrix = new THREE.Matrix4();
  const scale = new THREE.Vector3(TILE_SCALE_FACTOR, TILE_SCALE_FACTOR, TILE_SCALE_FACTOR);

  tiles.forEach((tile, index) => {
    const position = new THREE.Vector3(tile.position.x, 0, tile.position.z);
    const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    matrix.compose(position, quaternion, scale);
    instancedMesh.setMatrixAt(index, matrix);
  });

  instancedMesh.instanceMatrix.needsUpdate = true;

  return instancedMesh;
}
