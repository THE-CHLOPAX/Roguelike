import * as THREE from 'three';
import { isMesh, logger } from '@tgdf';
import { DebugDrawer, threeToTileCache } from '@recast-navigation/three';

export type generateNavMeshFromThreeDObjectOptions = Parameters<typeof threeToTileCache>[1];

export function generateNavMeshFromThreeDObject(
  object: THREE.Object3D,
  options?: generateNavMeshFromThreeDObjectOptions
) {
  const meshChildren: THREE.Mesh[] = [];
  object.traverse((child) => {
    if (isMesh(child)) {
      meshChildren.push(child);
    }
  });

  const { success, navMesh, tileCache } = threeToTileCache(meshChildren, {
    ...options,
    tileSize: options?.tileSize || 16,
  });

  if (!success) {
    logger({ message: 'Failed to generate nav mesh from the provided 3D object.', type: 'error' });
    return { navMesh: null, debugNavMesh: null, tileCache: null };
  }

  const debugNavMesh = new DebugDrawer();
  debugNavMesh.drawNavMesh(navMesh);

  return { tileCache, navMesh, debugNavMesh };
}
