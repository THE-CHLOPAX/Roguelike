import * as THREE from 'three';

const TOP_FACE_NORMAL_Y_THRESHOLD = 0.9;

/**
 * Isolates the triangles of `geometry` whose normal points upward once
 * `referenceQuaternion` is applied, e.g. the flat top surface of a tile mesh whose
 * remaining triangles are side/underside detail hidden between adjacent tiles.
 */
export function getTopFaceGeometry(
  geometry: THREE.BufferGeometry,
  referenceQuaternion: THREE.Quaternion
): THREE.BufferGeometry {
  const position = geometry.getAttribute('position');
  const normal = geometry.getAttribute('normal');
  const uv = geometry.getAttribute('uv');
  const index = geometry.getIndex();

  const vertexCount = index ? index.count : position.count;
  const getVertexIndex = index ? (i: number): number => index.getX(i) : (i: number): number => i;

  const topPositions: number[] = [];
  const topNormals: number[] = [];
  const topUvs: number[] = [];

  const rotatedNormal = new THREE.Vector3();

  for (let face = 0; face < vertexCount; face += 3) {
    const faceVertexIndexes = [
      getVertexIndex(face),
      getVertexIndex(face + 1),
      getVertexIndex(face + 2),
    ];

    const averageUpY =
      faceVertexIndexes.reduce((sum, vertexIndex) => {
        rotatedNormal
          .set(normal.getX(vertexIndex), normal.getY(vertexIndex), normal.getZ(vertexIndex))
          .applyQuaternion(referenceQuaternion);
        return sum + rotatedNormal.y;
      }, 0) / 3;

    if (averageUpY <= TOP_FACE_NORMAL_Y_THRESHOLD) continue;

    faceVertexIndexes.forEach((vertexIndex) => {
      topPositions.push(
        position.getX(vertexIndex),
        position.getY(vertexIndex),
        position.getZ(vertexIndex)
      );
      topNormals.push(normal.getX(vertexIndex), normal.getY(vertexIndex), normal.getZ(vertexIndex));
      if (uv) topUvs.push(uv.getX(vertexIndex), uv.getY(vertexIndex));
    });
  }

  const topGeometry = new THREE.BufferGeometry();
  topGeometry.setAttribute('position', new THREE.Float32BufferAttribute(topPositions, 3));
  topGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(topNormals, 3));
  if (uv) topGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(topUvs, 2));

  return topGeometry;
}
