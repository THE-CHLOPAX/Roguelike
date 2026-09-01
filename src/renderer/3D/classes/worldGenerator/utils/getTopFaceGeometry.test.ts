import * as THREE from 'three';
import { describe, it, expect } from 'vitest';

import { getTopFaceGeometry } from './getTopFaceGeometry';

const IDENTITY = new THREE.Quaternion();

function getPositions(geometry: THREE.BufferGeometry): THREE.Vector3[] {
  const position = geometry.getAttribute('position');
  const vertices: THREE.Vector3[] = [];
  for (let i = 0; i < position.count; i++) {
    vertices.push(new THREE.Vector3(position.getX(i), position.getY(i), position.getZ(i)));
  }
  return vertices;
}

describe('getTopFaceGeometry', () => {
  it('extracts only the +Y-facing quad of an indexed box geometry', () => {
    const box = new THREE.BoxGeometry(2, 2, 2);

    const topGeometry = getTopFaceGeometry(box, IDENTITY);

    // A box's top face is a quad = 2 triangles = 6 vertices (unindexed output).
    expect(topGeometry.getAttribute('position').count).toBe(6);
    getPositions(topGeometry).forEach((vertex) => {
      expect(vertex.y).toBeCloseTo(1); // BoxGeometry(2,2,2) top face sits at y=1
    });
  });

  it('extracts the same quad from a non-indexed equivalent geometry', () => {
    const box = new THREE.BoxGeometry(2, 2, 2).toNonIndexed();
    expect(box.getIndex()).toBeNull();

    const topGeometry = getTopFaceGeometry(box, IDENTITY);

    expect(topGeometry.getAttribute('position').count).toBe(6);
    getPositions(topGeometry).forEach((vertex) => {
      expect(vertex.y).toBeCloseTo(1);
    });
  });

  it('classifies faces relative to the reference quaternion, not the raw local normal', () => {
    const box = new THREE.BoxGeometry(2, 2, 2);
    // Rotate -90deg around X so the box's local +Z face becomes the "up" face.
    const referenceQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(-Math.PI / 2, 0, 0)
    );

    const topGeometry = getTopFaceGeometry(box, referenceQuaternion);

    expect(topGeometry.getAttribute('position').count).toBe(6);
    getPositions(topGeometry).forEach((vertex) => {
      expect(vertex.z).toBeCloseTo(1); // local +Z face sits at z=1
    });
  });

  it('preserves uv values for the extracted vertices', () => {
    const box = new THREE.BoxGeometry(2, 2, 2);

    const topGeometry = getTopFaceGeometry(box, IDENTITY);
    const uv = topGeometry.getAttribute('uv');

    expect(uv.count).toBe(6);
    for (let i = 0; i < uv.count; i++) {
      expect(uv.getX(i)).toBeGreaterThanOrEqual(0);
      expect(uv.getX(i)).toBeLessThanOrEqual(1);
      expect(uv.getY(i)).toBeGreaterThanOrEqual(0);
      expect(uv.getY(i)).toBeLessThanOrEqual(1);
    }
  });

  it('returns an empty geometry when no face points up', () => {
    const box = new THREE.BoxGeometry(2, 2, 2);
    // Rotate 90deg around Z so the +Y face now points sideways (+X), and no face
    // in the box ends up pointing up under this reference quaternion.
    const referenceQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, 0, Math.PI / 4)
    );

    const topGeometry = getTopFaceGeometry(box, referenceQuaternion);

    expect(topGeometry.getAttribute('position').count).toBe(0);
  });
});
