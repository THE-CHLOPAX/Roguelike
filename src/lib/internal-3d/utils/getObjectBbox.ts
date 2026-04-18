import * as THREE from 'three';

/**
 * Takes a THREE.Object3D and calculates its bounding box based on its geometry,
 * child geometries and scale.
 * @param object
 */
export function getObjectBbox(object: THREE.Object3D): THREE.Box3 {
  const bbox = new THREE.Box3();
  let foundMeshes = false;

  object.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      foundMeshes = true;

      // Compute bounding box for this mesh's geometry
      child.geometry.computeBoundingBox();

      if (child.geometry.boundingBox) {
        // Clone the bbox and apply the mesh's world transform
        const meshBbox = child.geometry.boundingBox.clone();
        meshBbox.applyMatrix4(child.matrixWorld);

        // Expand the combined bbox to include this mesh
        bbox.union(meshBbox);
      }
    }
  });

  if (!foundMeshes) {
    return new THREE.Box3();
  }

  return bbox;
}
