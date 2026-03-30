import * as THREE from 'three';

export function isMesh(object?: THREE.Object3D): object is THREE.Mesh {
  return object instanceof THREE.Mesh;
}
