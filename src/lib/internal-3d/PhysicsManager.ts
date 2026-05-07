import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { RigidBody } from '@tgdf/internal-game-components';

import { Emitter } from './Emitter';
import { GameObject } from './GameObject';
import { logger } from '../internal-ui/utils/logger';
import { PhysicsCollisionCallback, PhysicsManagerEventsMap } from './types/physics';

const FIXED_TIME_STEP = 1 / 144; // 144 FPS = ~0.00694 seconds
const MAX_SUB_STEPS = 5; // Prevent spiral of death

/**
 * PhysicsManager handles Rapier physics simulation with a fixed time step.
 * This ensures consistent physics behavior across different refresh rates (60Hz, 120Hz, 144Hz, etc.).
 *
 * Implementation uses an accumulator pattern:
 * - Physics always steps at a fixed rate (144 FPS)
 * - Variable frame times are accumulated
 * - Multiple physics steps can occur in a single frame if needed
 * - Prevents "spiral of death" by capping max substeps
 */
export class PhysicsManager {
  private _world?: RAPIER.World;
  private _eventQueue?: RAPIER.EventQueue;
  private _collisionSubscribers: Set<PhysicsCollisionCallback> = new Set();
  private _handlesMap: Map<RAPIER.RigidBodyHandle, GameObject> = new Map();
  private _bodies: Map<GameObject, RigidBody> = new Map();
  private _events: Emitter<PhysicsManagerEventsMap> = new Emitter<PhysicsManagerEventsMap>();
  private _isInitialized: boolean = false;

  // Fixed time step for physics simulation (144 FPS = 1/144 = ~0.00694 seconds)
  private _accumulator: number = 0;

  public get world(): RAPIER.World | undefined {
    if (!this._world) {
      logger({ message: 'Physics world is not initialized for this scene', type: 'warn' });
    }
    return this._world;
  }

  public get bodies(): Map<GameObject, RigidBody> | undefined {
    if (!this._bodies) {
      logger({ message: 'Physics bodies map is not initialized for this scene', type: 'warn' });
      return undefined;
    }
    return this._bodies;
  }

  public get isInitialized(): boolean {
    return this._isInitialized;
  }

  public get events(): Emitter<PhysicsManagerEventsMap> {
    return this._events;
  }

  public async init(gravity: THREE.Vector3): Promise<void> {
    await RAPIER.init();
    this._world = new RAPIER.World(gravity);
    this._eventQueue = new RAPIER.EventQueue(true);
    this._accumulator = 0; // Reset accumulator on init
    this._isInitialized = true;
    this.events.trigger('physicsinitialized', undefined);
  }

  public update(deltaTime: number): void {
    if (!this._world) return;

    // Add frame time to accumulator (cap deltaTime to prevent spiral of death)
    this._accumulator += Math.min(deltaTime, 0.1);

    // Run physics simulation in fixed time steps
    let subSteps = 0;
    while (this._accumulator >= FIXED_TIME_STEP && subSteps < MAX_SUB_STEPS) {
      this._step();
      this._accumulator -= FIXED_TIME_STEP;
      subSteps++;
    }
  }

  public onCollision(callback: PhysicsCollisionCallback): () => void {
    this._collisionSubscribers.add(callback);
    return () => this._collisionSubscribers.delete(callback);
  }

  public offCollision(callback: PhysicsCollisionCallback): void {
    this._collisionSubscribers.delete(callback);
  }

  public addBody(object: GameObject, body: RigidBody): void {
    if (!this._bodies) {
      logger({ message: 'Physics bodies map is not initialized', type: 'warn' });
      return;
    }

    const bodyHandle = body.getHandle();
    if (bodyHandle === null) {
      logger({
        message: 'Cannot add body to PhysicsManager: RigidBody does not have a valid handle',
        type: 'error',
      });
      return;
    }
    this._bodies.set(object, body);
    this._handlesMap.set(bodyHandle, object);
  }

  public getObjectFromBody(body: RigidBody): GameObject | undefined {
    if (!this._bodies) return undefined;
    const bodyHandle = body.getHandle();
    if (bodyHandle === null) {
      logger({
        message: 'Cannot get object from body: RigidBody does not have a valid handle',
        type: 'error',
      });
      return undefined;
    }
    return this._handlesMap.get(bodyHandle) || undefined;
  }

  public getBodyFromHandle(handle: RAPIER.RigidBodyHandle): RigidBody | null {
    if (!this._world) return null;
    const object = this._handlesMap.get(handle);
    if (!object) return null;
    return this._bodies.get(object) || null;
  }

  public getObjectFromHandle(handle: RAPIER.RigidBodyHandle): THREE.Object3D | undefined {
    const body = this.getBodyFromHandle(handle);
    if (!body) return undefined;
    return this.getObjectFromBody(body);
  }

  public removeBody(object: GameObject): void {
    if (!this._bodies) {
      logger({ message: 'Physics bodies map is not initialized', type: 'warn' });
      return;
    }
    const body = this._bodies.get(object);
    if (body && this._world) {
      const rigidBody = body.getRigidBody();
      const handle = body.getHandle();
      if (rigidBody) {
        this._world.removeRigidBody(rigidBody);
      }
      this._bodies.delete(object);
      if (handle !== null) {
        this._handlesMap.delete(handle);
      }
    } else {
      logger({
        message: 'Physics Manager: unable to remove body - body not found for the given object',
        type: 'error',
      });
    }
  }

  public dispose(): void {
    if (this._world) {
      this._world.free();
      this._world = undefined;
    }
    if (this._eventQueue) {
      this._eventQueue.free();
      this._eventQueue = undefined;
    }
    this._bodies.clear();
    this._handlesMap.clear();
    this._collisionSubscribers.clear();
    this._accumulator = 0; // Reset accumulator on dispose
    this._isInitialized = false;
  }

  private _step(): void {
    if (!this._world || !this._eventQueue) {
      logger({ message: 'Physics world or event queue is not initialized', type: 'warn' });
      return;
    }

    this._world.step(this._eventQueue);

    // Process collision events
    this._eventQueue.drainCollisionEvents((handle1, handle2, started) => {
      for (const cb of this._collisionSubscribers) {
        cb(handle1, handle2, started);
      }
    });
  }
}
