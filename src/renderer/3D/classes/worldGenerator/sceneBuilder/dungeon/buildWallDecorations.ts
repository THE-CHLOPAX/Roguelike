import * as THREE from 'three';
import { assert, getModelFromStore, isMesh, ModelRecord, Scene } from '@tgdf';

import { edgeDirectionKey } from '../../utils/edgeDirectionKey';
import { CELL_SIZE_METERS, TILE_SCALE_FACTOR } from '../../const';
import { getWallYawForEdge } from '../../utils/getWallYawForEdge';
import { isVisibleWallEdge } from '../../utils/isVisibleWallEdge';
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
        .filter((placement) => isVisibleWallEdge(placement.edge))
    )
  );

  const pillarPlacements = buildPillarPlacements(wallPlacements);

  parsedData.forEach((_cell, cellIndex) => {
    const cellWallPlacements = wallPlacements.filter((p) => p.cellIndex === cellIndex);
    const cellPillarPlacements = pillarPlacements.filter((p) => p.cellIndex === cellIndex);

    if (cellWallPlacements.length > 0) {
      const plinthInstancedMesh = buildWallPlacementInstancedMesh(
        plinthGeometry,
        plinthMaterial,
        cellWallPlacements
      );
      plinthInstancedMesh.position.y += CELL_SIZE_METERS;
      meshGroup.add(plinthInstancedMesh);
    }

    if (cellPillarPlacements.length > 0) {
      meshGroup.add(buildPillarInstancedMesh(pillarGeometry, pillarMaterial, cellPillarPlacements));
    }
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
    const yaw = getWallYawForEdge(edge);
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
  return `${position.x},${position.z},${edgeDirectionKey(edge)}`;
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
    const yaw = getWallYawForEdge(edge);

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
