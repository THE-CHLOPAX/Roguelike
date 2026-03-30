import * as THREE from 'three';
import { isMesh, logger } from '@tgdf';
import { threeToSoloNavMesh, DebugDrawer } from '@recast-navigation/three';

export type generateNavMeshFromThreeDObjectOptions = Parameters<typeof threeToSoloNavMesh>[1];

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

  const { success, navMesh } = threeToSoloNavMesh(meshChildren, {
    ...options,
  });

  if (!success) {
    logger({ message: 'Failed to generate nav mesh from the provided 3D object.', type: 'error' });
    return { navMesh: null, debugNavMesh: null };
  }

  const debugNavMesh = new DebugDrawer();
  debugNavMesh.drawNavMesh(navMesh);

  return { navMesh, debugNavMesh };
}
