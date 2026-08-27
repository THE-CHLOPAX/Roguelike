import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { assert, describe, it, expect, vi, beforeAll } from 'vitest';

vi.mock('electron', () => ({
  ipcRenderer: { send: vi.fn(), on: vi.fn(), removeListener: vi.fn(), once: vi.fn() },
}));

import { Scene, GameObject, RigidBody } from '@tgdf';
import { MockCamera } from '@tgdf/internal-3d/testUtils/MockCamera';

import { RigidFloorObject } from './RigidFloorObject';

class MockScene extends Scene {
  camera = new MockCamera();
}

function createFlatPlane(width: number, depth: number): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), new THREE.MeshBasicMaterial());
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

// Drops a dynamic box above the given world (x, z) position and steps physics forward,
// returning where it ends up.
async function dropBoxAt(scene: MockScene, x: number, z: number, startY = 3): Promise<number> {
  const dynamicObject = new GameObject({ scene });
  dynamicObject.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial()));
  dynamicObject.position.set(x, startY, z);
  scene.add(dynamicObject);

  const dynamicBody = new RigidBody(dynamicObject, { type: 'dynamic', colliderShape: 'box' });
  dynamicObject.addComponent('RigidBody', dynamicBody);
  dynamicObject.update(0);

  for (let i = 0; i < 300; i++) {
    scene.physics?.update(1 / 60);
    scene.physics?.syncDynamicBodies();
  }

  return dynamicObject.position.y;
}

async function createScene(): Promise<MockScene> {
  const scene = new MockScene();
  await scene.initializePhysicsWorld(new THREE.Vector3(0, -9.81, 0));
  return scene;
}

describe('RigidFloorObject', () => {
  beforeAll(async () => {
    await RAPIER.init();
  });

  it('builds a static collider centered on a single mesh positioned away from local origin', async () => {
    const scene = await createScene();
    const floorMesh = createFlatPlane(20, 20);
    floorMesh.position.set(100, 0, 100);

    const rigidFloorObject = new RigidFloorObject(scene, floorMesh);
    scene.add(rigidFloorObject);
    rigidFloorObject.update(0);

    const collider = rigidFloorObject.getGameObjectComponentByType(RigidBody)?.getPhysicsCollider();
    assert(collider !== null && collider !== undefined, 'Collider was not created');

    const translation = collider.translation();
    expect(translation.x).toBeCloseTo(100);
    expect(translation.y).toBeCloseTo(0);
    expect(translation.z).toBeCloseTo(100);

    const halfExtents = collider.halfExtents();
    expect(halfExtents.x * 2).toBeCloseTo(20);
    expect(halfExtents.z * 2).toBeCloseTo(20);

    // The debug wireframe must line up with the real (offset) collider, not sit at the
    // RigidFloorObject's own local origin.
    const debugMesh = rigidFloorObject.getGameObjectComponentByType(RigidBody)?.getDebugMesh();
    assert(debugMesh !== null && debugMesh !== undefined, 'Debug mesh was not created');
    expect(debugMesh.position.x).toBeCloseTo(100);
    expect(debugMesh.position.z).toBeCloseTo(100);
  });

  it('builds a collider spanning multiple meshes forming a floor group, wherever they sit', async () => {
    const scene = await createScene();

    // Three 5x5 tiles laid out edge-to-edge along X, matching how buildDungeonLevelScene
    // groups individual floor tile meshes.
    const floorGroup = new THREE.Group();
    [0, 5, 10].forEach((x) => {
      const tile = createFlatPlane(5, 5);
      tile.position.set(x, 0, 0);
      floorGroup.add(tile);
    });

    const rigidFloorObject = new RigidFloorObject(scene, floorGroup);
    scene.add(rigidFloorObject);
    rigidFloorObject.update(0);

    const collider = rigidFloorObject.getGameObjectComponentByType(RigidBody)?.getPhysicsCollider();
    assert(collider !== null && collider !== undefined, 'Collider was not created');

    // Tiles span x=[-2.5, 12.5] combined - the collider must cover the whole thing, not
    // just one tile.
    const translation = collider.translation();
    const halfExtents = collider.halfExtents();
    expect(translation.x).toBeCloseTo(5); // midpoint of the 3-tile span
    expect(halfExtents.x * 2).toBeCloseTo(15); // -2.5 to 12.5
  });

  it('stops a dynamic body dropped above the floor from falling through it', async () => {
    const scene = await createScene();
    const floorMesh = createFlatPlane(20, 20);

    const rigidFloorObject = new RigidFloorObject(scene, floorMesh);
    scene.add(rigidFloorObject);
    rigidFloorObject.update(0);

    const finalY = await dropBoxAt(scene, 0, 0);

    // The 1x1 box should come to rest just above the floor surface (~0.5), not fall
    // through it (which would leave it deeply negative).
    expect(finalY).toBeGreaterThan(0);
    expect(finalY).toBeLessThan(2);
  });

  it('stops a dynamic body from falling through a floor whose geometry sits far from local origin', async () => {
    const scene = await createScene();
    const floorMesh = createFlatPlane(20, 20);
    floorMesh.position.set(100, 0, 100);

    const rigidFloorObject = new RigidFloorObject(scene, floorMesh);
    scene.add(rigidFloorObject);
    rigidFloorObject.update(0);

    const finalY = await dropBoxAt(scene, 100, 100);

    expect(finalY).toBeGreaterThan(0);
    expect(finalY).toBeLessThan(2);
  });

  it('does not create a collider that catches bodies dropped well outside the floor footprint', async () => {
    const scene = await createScene();
    const floorMesh = createFlatPlane(20, 20);
    floorMesh.position.set(100, 0, 100);

    const rigidFloorObject = new RigidFloorObject(scene, floorMesh);
    scene.add(rigidFloorObject);
    rigidFloorObject.update(0);

    // Far outside the 20x20 floor's footprint (which spans x/z 90-110) - should fall
    // freely, proving the collider is correctly bounded rather than accidentally huge.
    const finalY = await dropBoxAt(scene, -500, -500);

    expect(finalY).toBeLessThan(-50);
  });
});
