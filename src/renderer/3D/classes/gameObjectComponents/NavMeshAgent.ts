import * as THREE from 'three';
import { GameObjectComponent, logger } from '@tgdf';
import { Crowd, CrowdAgent, CrowdAgentParams } from '@recast-navigation/core';

import { Entity } from '../gameObjects/Entity';

/**
 * Those are arbitrary, tunable values that were
 * necessary to make agent speeds match corresponding
 * speeds for regular RigidBody movement. Do not change
 * unless you know what you're doing.
 */
const ACCELERATION_MULTIPLIER = 15; // Has to be high enough to accelerate quickly and decelerate without overshooting.
const VELOCITY_MULTIPLIER = 2.4;

export class NavMeshAgent extends GameObjectComponent {
  private _crowd: Crowd;
  private _agentInstance: CrowdAgent | null = null;
  private _options?: Partial<CrowdAgentParams>;

  private _currentMovePromise: {
    resolve: () => void;
    reject: (reason?: unknown) => void;
    target: THREE.Vector3;
  } | null = null;

  constructor(gameObject: Entity, crowd: Crowd, options?: Partial<CrowdAgentParams>) {
    super(gameObject);

    this._crowd = crowd;
    this._options = options;
  }

  public setDestination(
    target: THREE.Vector3,
    speed = this.gameObject.movementController.defaultSpeed
  ): void {
    if (!this._agentInstance) {
      this._logNoAgentError();
      return;
    }

    this._agentInstance.setParameters({
      maxSpeed: speed * VELOCITY_MULTIPLIER,
      maxAcceleration: speed * ACCELERATION_MULTIPLIER,
    });
    this._agentInstance.requestMoveTarget(target);
  }

  public moveTo(
    target: THREE.Vector3,
    speed = this.gameObject.movementController.defaultSpeed
  ): Promise<void> {
    if (!this._agentInstance) {
      this._logNoAgentError();
      return Promise.reject(new Error('NavMeshAgent instance not initialized yet.'));
    }

    this.setDestination(target, speed);

    // If there's an active movement, resolve it (interrupted)
    if (this._currentMovePromise) {
      this._currentMovePromise.resolve();
      this._currentMovePromise = null;
    }

    // Create a new promise for this movement
    return new Promise<void>((resolve, reject) => {
      this._currentMovePromise = {
        resolve,
        reject,
        target: target.clone(),
      };
    });
  }

  public resetMovementTarget(): void {
    if (!this._agentInstance) {
      this._logNoAgentError();
      return;
    }

    // Resolve any active movement promise (interrupted)
    if (this._currentMovePromise) {
      this._currentMovePromise.resolve();
      this._currentMovePromise = null;
    }

    this._agentInstance.resetMoveTarget();
  }

  public move(
    direction: THREE.Vector3,
    speed = this.gameObject.movementController.defaultSpeed
  ): void {
    if (!this._agentInstance) {
      this._logNoAgentError();
      return;
    }

    this._agentInstance.setParameters({
      maxSpeed: speed * VELOCITY_MULTIPLIER,
      maxAcceleration: speed * ACCELERATION_MULTIPLIER,
    });
    this._agentInstance.requestMoveVelocity(direction.multiplyScalar(speed * VELOCITY_MULTIPLIER));
  }

  public get target(): THREE.Vector3 | null {
    if (!this._agentInstance) {
      this._logNoAgentError();
      return null;
    }

    return new THREE.Vector3().copy(this._agentInstance.target());
  }

  public get position(): THREE.Vector3 {
    if (!this._agentInstance) {
      this._logNoAgentError();
      return new THREE.Vector3();
    }

    return new THREE.Vector3().copy(this._agentInstance.position());
  }

  public get velocity(): THREE.Vector3 | null {
    return this.gameObject.movementController.velocity;
  }

  public override get gameObject(): Entity {
    return super.gameObject as Entity;
  }

  protected override onAwake(): void {
    super.onAwake();

    // Use provided options or sensible defaults
    const params = {
      radius: 0.5,
      height: 2.0,
      collisionQueryRange: 0.5 * 12,
      pathOptimizationRange: 0.5 * 30,
      separationWeight: 2.0,
      ...this._options,
    };

    this._agentInstance = this._crowd.addAgent(this.gameObject.position, params);
  }

  protected override onUpdate(_deltaTime: number): void {
    if (!this._agentInstance) {
      this._logNoAgentError();
      return;
    }

    // Sync physics position to agent's internal position to prevent desync issues
    const actualPos = this.gameObject.position;
    const agentPos = this._agentInstance.position();

    const rigidBody = this.gameObject.rigidBody?.getRigidBody();

    if (!rigidBody) return;

    rigidBody.setTranslation(
      {
        x: agentPos.x,
        y: actualPos.y,
        z: agentPos.z,
      },
      false
    );

    // Rotate towards movement direction
    const velocity = this._agentInstance.velocity();
    const horizontalVelocity = new THREE.Vector3(velocity.x, 0, velocity.z);
    this.gameObject.movementController.rotate(horizontalVelocity);

    if (this._currentMovePromise) {
      const currentPos = new THREE.Vector3(agentPos.x, agentPos.y, agentPos.z);
      const distanceToTarget = currentPos.distanceTo(this._currentMovePromise.target);
      const velocityMagnitude = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);

      // Agent has reached target if it's close enough and has stopped moving
      const ARRIVAL_THRESHOLD = 0.5; // Distance threshold in world units
      const VELOCITY_THRESHOLD = 0.1; // Velocity threshold

      if (distanceToTarget < ARRIVAL_THRESHOLD && velocityMagnitude < VELOCITY_THRESHOLD) {
        this._currentMovePromise.resolve();
        this._currentMovePromise = null;
      }
    }
  }

  public override destroy(): void {
    super.destroy();
    if (this._agentInstance) {
      this._crowd.removeAgent(this._agentInstance);
      this._agentInstance = null;
    }
  }

  private _logNoAgentError() {
    logger({
      message: 'NavMeshAgent instance not initialized yet.',
      type: 'error',
    });
  }
}
