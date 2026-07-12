import { Mock } from 'moq.ts';
import * as THREE from 'three';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('electron', () => ({
  ipcRenderer: { send: vi.fn(), on: vi.fn(), removeListener: vi.fn(), once: vi.fn() },
}));

import { RigidBody } from '../RigidBody';
import { Scene } from '../../internal-3d/Scene/Scene';
import { MovementController } from './MovementController';
import { GameObject } from '../../internal-3d/GameObject/GameObject';
import { MOVE_TO_ARRIVAL_THRESHOLD, MOVEMENT_CONTROLLER_MESSAGES } from './constants';

class TestScene extends Scene {
  camera = new THREE.PerspectiveCamera();
}

function createMovementController(position = new THREE.Vector3(0, 0, 0)) {
  const scene = new TestScene();
  const gameObject = new GameObject({ scene });
  gameObject.position.copy(position);
  scene.add(gameObject);

  const velocity = new THREE.Vector3();
  const setLinearVelocity = vi.fn((nextVelocity: THREE.Vector3) => {
    velocity.copy(nextVelocity);
  });

  const rigidBody = new Mock<RigidBody>()
    .setup((body) => body.getLinearVelocity)
    .returns(() => velocity.clone())
    .setup((body) => body.setLinearVelocity)
    .returns(setLinearVelocity)
    .setup((body) => body.setEulerRotation)
    .returns(vi.fn())
    .object();

  const controller = new MovementController(gameObject, rigidBody, {
    defaultSpeed: 5,
    sprintSpeed: 10,
  });

  gameObject.addComponent('MovementController', controller);

  const triggerUpdate = (deltaTime = 0.16) => {
    gameObject.events.trigger('update', { deltaTime });
  };

  return { controller, gameObject, rigidBody, velocity, setLinearVelocity, triggerUpdate };
}

describe('MovementController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('moveTo', () => {
    it('moves toward the target on update', () => {
      const { controller, triggerUpdate, setLinearVelocity } = createMovementController();
      const target = new THREE.Vector3(10, 0, 0);

      void controller.moveTo(target, 7);
      triggerUpdate();

      expect(setLinearVelocity).toHaveBeenCalledWith(expect.objectContaining({ x: 7, y: 0, z: 0 }));
    });

    it('resolves when the target is reached', async () => {
      const { controller, gameObject, triggerUpdate } = createMovementController();
      const target = new THREE.Vector3(MOVE_TO_ARRIVAL_THRESHOLD / 2, 0, 0);

      const moveToPromise = controller.moveTo(target);
      gameObject.position.set(MOVE_TO_ARRIVAL_THRESHOLD / 4, 0, 0);
      triggerUpdate();

      await expect(moveToPromise).resolves.toBeUndefined();
    });

    it('rejects when resetMoveTo is called', async () => {
      const { controller, triggerUpdate } = createMovementController();
      const target = new THREE.Vector3(10, 0, 0);

      const moveToPromise = controller.moveTo(target);
      triggerUpdate();
      controller.resetMoveTo();

      await expect(moveToPromise).rejects.toThrow(MOVEMENT_CONTROLLER_MESSAGES.MOVE_TO_CANCELLED);
    });

    it('rejects when movement is disabled before reaching the target', async () => {
      const { controller, triggerUpdate } = createMovementController();
      const target = new THREE.Vector3(10, 0, 0);

      const moveToPromise = controller.moveTo(target);
      triggerUpdate();
      controller.toggleMovementDisabled(true);
      triggerUpdate();

      await expect(moveToPromise).rejects.toThrow(MOVEMENT_CONTROLLER_MESSAGES.MOVE_TO_CANCELLED);
    });

    it('cancels the previous moveTo when a new target is set', async () => {
      const { controller, gameObject, triggerUpdate } = createMovementController();
      const firstTarget = new THREE.Vector3(10, 0, 0);
      const secondTarget = new THREE.Vector3(0, 0, MOVE_TO_ARRIVAL_THRESHOLD / 2);

      const firstMoveToPromise = controller.moveTo(firstTarget);
      const secondMoveToPromise = controller.moveTo(secondTarget);

      await expect(firstMoveToPromise).rejects.toThrow(
        MOVEMENT_CONTROLLER_MESSAGES.MOVE_TO_CANCELLED
      );

      gameObject.position.set(0, 0, 0);
      triggerUpdate();

      await expect(secondMoveToPromise).resolves.toBeUndefined();
    });
  });

  describe('moveAlongPath', () => {
    it('moves toward each waypoint in order and resolves after the last one is reached', async () => {
      const { controller, gameObject, triggerUpdate } = createMovementController();
      const path = [
        new THREE.Vector3(MOVE_TO_ARRIVAL_THRESHOLD / 2, 0, 0),
        new THREE.Vector3(MOVE_TO_ARRIVAL_THRESHOLD / 2, 0, MOVE_TO_ARRIVAL_THRESHOLD / 2),
      ];

      const moveAlongPathPromise = controller.moveAlongPath(path);

      gameObject.position.copy(path[0]);
      triggerUpdate();

      gameObject.position.copy(path[1]);
      triggerUpdate();

      await expect(moveAlongPathPromise).resolves.toBeUndefined();
    });

    it('resolves without moving when the path is empty', async () => {
      const { controller, setLinearVelocity } = createMovementController();

      await expect(controller.moveAlongPath([])).resolves.toBeUndefined();
      expect(setLinearVelocity).not.toHaveBeenCalled();
    });

    it('resolves without moving when movement is disabled', async () => {
      const { controller, setLinearVelocity } = createMovementController();
      controller.toggleMovementDisabled(true);

      const path = [new THREE.Vector3(10, 0, 0)];
      await expect(controller.moveAlongPath(path)).resolves.toBeUndefined();
      expect(setLinearVelocity).not.toHaveBeenCalled();
    });
  });
});
