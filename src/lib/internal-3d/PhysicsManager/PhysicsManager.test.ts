import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { describe, it, expect, vi, beforeAll } from 'vitest';

import { Scene } from '../Scene/Scene';
import { PhysicsManager } from './PhysicsManager';
import { MockCamera } from '../testUtils/MockCamera';
import { GameObject } from '../GameObject/GameObject';
import { RigidBody } from '../../internal-game-components/RigidBody';

vi.mock('electron', () => ({
  ipcRenderer: { send: vi.fn(), on: vi.fn(), removeListener: vi.fn(), once: vi.fn() },
}));

class MockScene extends Scene {
  camera = new MockCamera();
}

async function setupRigidBody(type: 'dynamic' | 'kinematic' = 'dynamic') {
  const scene = new MockScene();
  await scene.initializePhysicsWorld(new THREE.Vector3(0, -9.81, 0));
  const manager = scene.physics as PhysicsManager;

  const gameObject = new GameObject({ scene });
  gameObject.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial()));
  scene.add(gameObject);

  const rigidBody = new RigidBody(gameObject, { type });
  gameObject.addComponent('RigidBody', rigidBody);
  gameObject.update(0);

  return { scene, manager, gameObject, rigidBody };
}

describe('PhysicsManager', () => {
  beforeAll(async () => {
    await RAPIER.init();
  });

  it('initializes the world and emits physicsinitialized', async () => {
    const manager = new PhysicsManager();
    const initHandler = vi.fn();
    manager.events.on('physicsinitialized', initHandler);

    await manager.init(new THREE.Vector3(0, -9.81, 0));

    expect(manager.isInitialized).toBe(true);
    expect(manager.world).toBeDefined();
    expect(initHandler).toHaveBeenCalledOnce();
  });

  it('registers bodies and resolves them by handle', async () => {
    const { manager, gameObject, rigidBody } = await setupRigidBody();
    const handle = rigidBody.getHandle();

    expect(handle).not.toBeNull();
    if (handle === null) return;

    expect(manager.bodies.get(gameObject)).toBe(rigidBody);
    expect(manager.getBodyFromHandle(handle)).toBe(rigidBody);
    expect(manager.getObjectFromHandle(handle)).toBe(gameObject);
  });

  it('removes registered bodies from the manager', async () => {
    const { manager, gameObject } = await setupRigidBody();

    manager.removeBody(gameObject);

    expect(manager.bodies.has(gameObject)).toBe(false);
  });

  it('syncs dynamic bodies from physics', async () => {
    const { manager, rigidBody } = await setupRigidBody('dynamic');
    const syncSpy = vi.spyOn(rigidBody, 'syncFromPhysics');

    manager.syncDynamicBodies();

    expect(syncSpy).toHaveBeenCalledOnce();
  });

  it('steps the simulation on update without throwing', async () => {
    const { manager } = await setupRigidBody();

    expect(() => manager.update(1 / 144)).not.toThrow();
  });

  it('unsubscribes collision callbacks', async () => {
    const { manager } = await setupRigidBody();
    const callback = vi.fn();

    const unsubscribe = manager.onCollision(callback);
    unsubscribe();
    manager.offCollision(callback);

    expect(() => manager.update(1 / 144)).not.toThrow();
  });

  it('dispose clears initialized state and bodies', async () => {
    const { manager, gameObject } = await setupRigidBody();

    manager.dispose();

    expect(manager.isInitialized).toBe(false);
    expect(manager.world).toBeUndefined();
    expect(manager.bodies.size).toBe(0);
    expect(manager.bodies.has(gameObject)).toBe(false);
  });
});
