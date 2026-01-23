import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

import { Emitter } from './Emitter';
import { logger } from '../internal-ui/utils/logger';
import { PhysicsCollisionCallback, PhysicsManagerEventsMap } from './types/physics';

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
    private _bodies: Map<THREE.Object3D, RAPIER.RigidBody> = new Map();
    private _events: Emitter<PhysicsManagerEventsMap> = new Emitter<PhysicsManagerEventsMap>();
    private _isInitialized: boolean = false;

    // Fixed time step for physics simulation (144 FPS = 1/144 = ~0.00694 seconds)
    private readonly FIXED_TIME_STEP = 1 / 144;
    private readonly MAX_SUB_STEPS = 5; // Prevent spiral of death
    private _accumulator: number = 0;

    public get world(): RAPIER.World | undefined {
        if (!this._world) {
            logger({ message: 'Physics world is not initialized for this scene', type: 'warn' });
        }
        return this._world;
    }

    public get bodies(): Map<THREE.Object3D, RAPIER.RigidBody> | undefined {
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
    };

    public update(deltaTime: number): void {
        if (!this._world) return;

        // Add frame time to accumulator (cap deltaTime to prevent spiral of death)
        this._accumulator += Math.min(deltaTime, 0.1);

        // Run physics simulation in fixed time steps
        let subSteps = 0;
        while (this._accumulator >= this.FIXED_TIME_STEP && subSteps < this.MAX_SUB_STEPS) {
            this._step();
            this._accumulator -= this.FIXED_TIME_STEP;
            subSteps++;
        }

        if (!this._bodies) {
            logger({ message: 'Physics bodies map is not initialized', type: 'warn' });
            return;
        }

        // Sync Three.js objects with physics bodies
        this._bodies.forEach((body, object) => {
            const translation = body.translation();
            const rotation = body.rotation();

            object.position.set(translation.x, translation.y, translation.z);
            object.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        });
    }

    public onCollision(callback: PhysicsCollisionCallback): () => void {
        this._collisionSubscribers.add(callback);
        return () => this._collisionSubscribers.delete(callback);
    }

    public addBody(object: THREE.Object3D, body: RAPIER.RigidBody): void {
        if (!this._bodies) {
            logger({ message: 'Physics bodies map is not initialized', type: 'warn' });
            return;
        }
        this._bodies.set(object, body);
    }

    public removeBody(object: THREE.Object3D): void {
        if (!this._bodies) {
            logger({ message: 'Physics bodies map is not initialized', type: 'warn' });
            return;
        }
        const body = this._bodies.get(object);
        if (body && this._world) {
            this._world.removeRigidBody(body);
            this._bodies.delete(object);
        } else {
            logger({ message: 'Physics Manager: unable to remove body - body not found for the given object', type: 'error' });
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