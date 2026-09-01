import * as THREE from 'three';
import { arrayShallowIncludes, assert, getModelFromStore, isMesh, ModelRecord, Scene } from '@tgdf';

import { CELL_SIZE_METERS, TILE_SCALE_FACTOR } from '../../const';
import { getWallPositionOnTile } from '../../utils/getWallPositionOnTile';
import { pixelateModelMaterial } from '../../utils/pixelateModelMaterial';
import { SceneBuilderCell, SceneBuilderCellTile, WorldGeneratorVec2 } from '../../types';

type WallPlacement = {
  tile: SceneBuilderCellTile;
  edge: WorldGeneratorVec2;
  cellIndex: number;
};

type PillarPlacement = {
  position: THREE.Vector3;
  yaw: number;
  cellIndex: number;
};

const WALL_DECORATIONS_GROUP_NAME = 'level-wall-decorations-group';

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

export function buildWallDecorations(
  scene: Scene,
  parsedData: SceneBuilderCell[],
  plinthModelRecord: ModelRecord,
  pillarModelRecord: ModelRecord
): THREE.Group {
  const meshGroup = new THREE.Group();
  meshGroup.name = WALL_DECORATIONS_GROUP_NAME;

  const plinthModel = getModelFromStore(plinthModelRecord.id);
  const plinthMesh = plinthModel?.children[0];

  assert(isMesh(plinthMesh));

  const plinthGeometry = plinthMesh.geometry;
  const plinthMaterial = plinthMesh.material;
  pixelateModelMaterial(plinthMaterial);

  const pillarModel = getModelFromStore(pillarModelRecord.id);
  const pillarMesh = pillarModel?.children[0];

  assert(isMesh(pillarMesh));

  const pillarGeometry = pillarMesh.geometry;
  const pillarMaterial = pillarMesh.material;
  pixelateModelMaterial(pillarMaterial);

  const wallPlacements: WallPlacement[] = parsedData.flatMap((cell, cellIndex) =>
    cell.cellTiles.flatMap((tile) =>
      tile.edges
        .map((edge) => ({ tile, edge, cellIndex }))
        .filter((placement) => arrayShallowIncludes(VISIBLE_WALL_EDGE_DIRECTIONS, placement.edge))
    )
  );

  const pillarPlacements = buildPillarPlacements(wallPlacements);

  parsedData.forEach((_cell, cellIndex) => {
    const cellWallPlacements = wallPlacements.filter((p) => p.cellIndex === cellIndex);
    const cellPillarPlacements = pillarPlacements.filter((p) => p.cellIndex === cellIndex);

    const plinthInstancedMesh = buildWallPlacementInstancedMesh(
      plinthGeometry,
      plinthMaterial,
      cellWallPlacements
    );
    plinthInstancedMesh.position.y += CELL_SIZE_METERS;
    meshGroup.add(plinthInstancedMesh);

    meshGroup.add(buildPillarInstancedMesh(pillarGeometry, pillarMaterial, cellPillarPlacements));
  });

  scene.add(meshGroup);

  return meshGroup;
}

function buildPillarPlacements(wallPlacements: WallPlacement[]): PillarPlacement[] {
  const wallPlacementKeys = new Set(
    wallPlacements.map(({ tile, edge }) => getWallPlacementKey(tile.position, edge))
  );

  const pillarPlacements: PillarPlacement[] = [];

  wallPlacements.forEach(({ tile, edge, cellIndex }) => {
    const wallCenter = getWallPositionOnTile(tile, edge);
    const yaw = WALL_YAW_BY_EDGE_DIRECTION[`${edge.x},${edge.z}`] ?? 0;
    const lengthAxis: WorldGeneratorVec2 = { x: edge.z, z: edge.x };

    pillarPlacements.push({
      position: new THREE.Vector3(
        wallCenter.x + (lengthAxis.x * CELL_SIZE_METERS) / 2,
        0,
        wallCenter.z + (lengthAxis.z * CELL_SIZE_METERS) / 2
      ),
      yaw,
      cellIndex,
    });

    const negativeSideNeighbourPosition: WorldGeneratorVec2 = {
      x: tile.position.x - lengthAxis.x * CELL_SIZE_METERS,
      z: tile.position.z - lengthAxis.z * CELL_SIZE_METERS,
    };
    const hasNegativeSideNeighbour = wallPlacementKeys.has(
      getWallPlacementKey(negativeSideNeighbourPosition, edge)
    );

    if (!hasNegativeSideNeighbour) {
      pillarPlacements.push({
        position: new THREE.Vector3(
          wallCenter.x - (lengthAxis.x * CELL_SIZE_METERS) / 2,
          0,
          wallCenter.z - (lengthAxis.z * CELL_SIZE_METERS) / 2
        ),
        yaw,
        cellIndex,
      });
    }
  });

  return pillarPlacements;
}

function getWallPlacementKey(position: WorldGeneratorVec2, edge: WorldGeneratorVec2): string {
  return `${position.x},${position.z},${edge.x},${edge.z}`;
}

function buildWallPlacementInstancedMesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material | THREE.Material[],
  placements: WallPlacement[]
): THREE.InstancedMesh {
  const instancedMesh = new THREE.InstancedMesh(geometry, material, placements.length);

  const matrix = new THREE.Matrix4();
  const scale = new THREE.Vector3(TILE_SCALE_FACTOR, TILE_SCALE_FACTOR, TILE_SCALE_FACTOR);

  placements.forEach(({ tile, edge }, index) => {
    const position = getWallPositionOnTile(tile, edge);
    const yaw = WALL_YAW_BY_EDGE_DIRECTION[`${edge.x},${edge.z}`] ?? 0;

    const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, yaw));
    matrix.compose(position, quaternion, scale);
    instancedMesh.setMatrixAt(index, matrix);
  });

  instancedMesh.instanceMatrix.needsUpdate = true;

  return instancedMesh;
}

function buildPillarInstancedMesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material | THREE.Material[],
  placements: PillarPlacement[]
): THREE.InstancedMesh {
  const instancedMesh = new THREE.InstancedMesh(geometry, material, placements.length);

  const matrix = new THREE.Matrix4();
  const scale = new THREE.Vector3(TILE_SCALE_FACTOR, TILE_SCALE_FACTOR, TILE_SCALE_FACTOR);

  placements.forEach(({ position, yaw }, index) => {
    const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, yaw));
    matrix.compose(position, quaternion, scale);
    instancedMesh.setMatrixAt(index, matrix);
  });

  instancedMesh.instanceMatrix.needsUpdate = true;

  return instancedMesh;
}
