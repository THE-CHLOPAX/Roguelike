import * as THREE from 'three';

export function isChildOfObject(
  child: THREE.Object3D,
  parent: THREE.Object3D | THREE.Scene
): boolean {
  let isChild = false;
  parent.traverse((object: THREE.Object3D) => {
    if (object === child) {
      isChild = true;
    }
  });
  return isChild;
}
