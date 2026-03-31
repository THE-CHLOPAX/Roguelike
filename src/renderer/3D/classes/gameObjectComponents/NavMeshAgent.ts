import * as THREE from 'three';
import { GameObjectComponent, logger } from '@tgdf';
import { Crowd, CrowdAgent, CrowdAgentParams } from '@recast-navigation/core';

import { MovableRigidGameObject } from '../gameObjects/MovableRigidGameObject';

/**
 * TODO:
 * - Agent doesn't use existing MovableRigidGameObject movement logic - this is unacceptable
 * - There's a lot of boilerplate to setup navmesh, crowds, agents, create
 * obstacles etc - we need to abstract all of this away and provide a simple API for development
 */

export class NavMeshAgent extends GameObjectComponent {
  private _crowd: Crowd;
  private _agentInstance: CrowdAgent | null = null;

  private _options?: Partial<CrowdAgentParams>;

  constructor(
    gameObject: MovableRigidGameObject,
    crowd: Crowd,
    options?: Partial<CrowdAgentParams>
  ) {
    super(gameObject);

    this._crowd = crowd;
    this._options = options;
  }

  public requestMoveTarget(target: THREE.Vector3): void {
    if (!this._agentInstance) {
      this._logNoAgentError();
      return;
    }

    this._agentInstance.requestMoveTarget(target);
  }

  public resetMoveTarget(): void {
    if (!this._agentInstance) {
      this._logNoAgentError();
      return;
    }

    this._agentInstance.resetMoveTarget();
  }

  public requestMoveVelocity(velocity: THREE.Vector3): void {
    if (!this._agentInstance) {
      this._logNoAgentError();
      return;
    }

    this._agentInstance.requestMoveVelocity(velocity);
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

  public get velocity(): THREE.Vector3 {
    if (!this._agentInstance) {
      this._logNoAgentError();
      return new THREE.Vector3();
    }

    return new THREE.Vector3().copy(this._agentInstance.velocity());
  }

  public override get gameObject(): MovableRigidGameObject {
    return super.gameObject as MovableRigidGameObject;
  }

  protected override onAwake(): void {
    super.onAwake();

    // Use provided options or sensible defaults
    const params = {
      radius: 0.5,
      height: 2.0,
      maxAcceleration: 8.0,
      maxSpeed: 3.5,
      collisionQueryRange: 0.5 * 12,
      pathOptimizationRange: 0.5 * 30,
      separationWeight: 2.0,
      ...this._options,
    };

    this._agentInstance = this._crowd.addAgent(this.gameObject.position, params);
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
