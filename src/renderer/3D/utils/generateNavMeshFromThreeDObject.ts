import * as THREE from 'three';
import { threeToSoloNavMesh, DebugDrawer } from '@recast-navigation/three';

export type generateNavMeshFromThreeDObjectOptions = Parameters<typeof threeToSoloNavMesh>[1];

export function generateNavMeshFromThreeDObject(
  object: THREE.Object3D,
  options?: generateNavMeshFromThreeDObjectOptions
) {
  const meshChildren: THREE.Mesh[] = [];
  object.traverse((child) => {
    if (child.type === 'Mesh') {
      meshChildren.push(child as THREE.Mesh);
    }
  });

  const { success, navMesh } = threeToSoloNavMesh(meshChildren, {
    ...options,
  });

  if (!success) {
    console.error('Failed to generate nav mesh from the provided 3D object.');
    return { navMesh: null, debugNavMesh: null };
  }

  const debugNavMesh = new DebugDrawer();
  debugNavMesh.drawNavMesh(navMesh);

  return { navMesh, debugNavMesh };
}
