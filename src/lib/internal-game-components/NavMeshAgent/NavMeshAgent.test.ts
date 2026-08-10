import * as THREE from 'three';
import { init, Crowd } from '@recast-navigation/core';
import { threeToSoloNavMesh } from '@recast-navigation/three';
import { describe, it, expect, vi, assert, beforeAll } from 'vitest';

vi.mock('electron', () => ({
  ipcRenderer: { send: vi.fn(), on: vi.fn(), removeListener: vi.fn(), once: vi.fn() },
}));

import { NavMeshAgent } from './NavMeshAgent';
import { Scene } from '../../internal-3d/Scene/Scene';
import { MockCamera } from '../../internal-3d/testUtils/MockCamera';
import { GameObject } from '../../internal-3d/GameObject/GameObject';

class TestScene extends Scene {
  camera = new MockCamera();
}

// A floor spanning x/z: [-10, 10], with its walkable top surface at y = 0.
const FLOOR_SIZE = 20;

// A wall crossing the floor's midline (x = 0), leaving clear corridors of
// floor at |z| > 5 on either side for an agent to route around it through.
const WALL_WIDTH = 2;
const WALL_HEIGHT = 3;
const WALL_DEPTH = 10;

function buildFloorMesh(): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(FLOOR_SIZE, 0.2, FLOOR_SIZE));
  mesh.position.set(0, -0.1, 0);
  return mesh;
}

function buildWallMesh(): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(WALL_WIDTH, WALL_HEIGHT, WALL_DEPTH));
  mesh.position.set(0, WALL_HEIGHT / 2, 0);
  return mesh;
}

function buildNavMeshAgent(meshes: THREE.Mesh[], startPosition: THREE.Vector3): NavMeshAgent {
  const result = threeToSoloNavMesh(meshes);
  assert(result.success, 'Failed to build test NavMesh');

  const crowd = new Crowd(result.navMesh, { maxAgents: 1, maxAgentRadius: 0.5 });

  const gameObject = new GameObject({ scene: new TestScene() });
  gameObject.position.copy(startPosition);

  return new NavMeshAgent(gameObject, crowd);
}

function getPathLength(path: THREE.Vector3[]): number {
  let length = 0;
  for (let i = 1; i < path.length; i++) {
    length += path[i - 1].distanceTo(path[i]);
  }
  return length;
}

describe('NavMeshAgent', () => {
  beforeAll(async () => {
    await init();
  });

  it('calculates a straight-line path when nothing blocks the way', () => {
    const start = new THREE.Vector3(-5, 0, 0);
    const target = new THREE.Vector3(5, 0, 0);

    const agent = buildNavMeshAgent([buildFloorMesh()], start);
    const path = agent.calculatePath(target);

    assert(path !== null, 'Expected a path to be found');
    expect(path.length).toBeGreaterThanOrEqual(2);

    const directDistance = start.distanceTo(target);
    expect(getPathLength(path)).toBeLessThan(directDistance * 1.05);
  });

  it('routes around an obstacle blocking the direct line between two points', () => {
    const start = new THREE.Vector3(-5, 0, 0);
    const target = new THREE.Vector3(5, 0, 0);

    const agent = buildNavMeshAgent([buildFloorMesh(), buildWallMesh()], start);
    const path = agent.calculatePath(target);

    assert(path !== null, 'Expected a path to be found');

    const directDistance = start.distanceTo(target);
    // The wall blocks the direct line, so the path must detour and end up
    // noticeably longer than a straight line from start to target.
    expect(getPathLength(path)).toBeGreaterThan(directDistance * 1.2);

    // The detour must actually clear the wall's far edge (z = +/- 5) rather
    // than somehow cutting through it.
    const wallHalfDepth = WALL_DEPTH / 2;
    expect(path.some((point) => Math.abs(point.z) > wallHalfDepth - 1)).toBe(true);
  });

  it('returns null when the target is nowhere near the NavMesh', () => {
    const start = new THREE.Vector3(-5, 0, 0);
    const unreachableTarget = new THREE.Vector3(1000, 0, 0);

    const agent = buildNavMeshAgent([buildFloorMesh()], start);
    const path = agent.calculatePath(unreachableTarget);

    expect(path).toBeNull();
  });
});
