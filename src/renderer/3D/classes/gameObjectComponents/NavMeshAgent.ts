import * as THREE from 'three';
import { GameObjectComponent, logger } from '@tgdf';
import { Crowd, CrowdAgent, CrowdAgentParams } from '@recast-navigation/core';

import { MovableGameObject } from '../gameObjects/MovableGameObject';

/**
 * TODO:
 * - Agent doesn't use existing MovableGameObject movement logic - this is unacceptable
 * - There's a lot of boilerplate to setup navmesh, crowds, agents, create
 * obstacles etc - we need to abstract all of this away and provide a simple API for development
 * - Navmesh doesnt get updated when we add/remove obstacles
 */

export class NavMeshAgent extends GameObjectComponent {
  private _crowd: Crowd;
  private _agentInstance: CrowdAgent | null = null;
  private _options?: Partial<CrowdAgentParams>;

  constructor(gameObject: MovableGameObject, crowd: Crowd, options?: Partial<CrowdAgentParams>) {
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

  public override get gameObject(): MovableGameObject {
    return super.gameObject as MovableGameObject;
  }

  protected override onUpdate(deltaTime: number): void {
    super.onUpdate(deltaTime);

    if (!this._agentInstance) {
      this._logNoAgentError();
      return;
    }

    // Update the physics body's position based on the crowd simulation
    const agentPosition = this._agentInstance.position();
    const rigidBody = this.gameObject.rigidBody;

    if (rigidBody?.body) {
      rigidBody.body.setTranslation(
        { x: agentPosition.x, y: rigidBody.body.translation().y, z: agentPosition.z },
        false
      );
    } else {
      // Fallback: if no rigid body, update position directly
      this.gameObject.position.copy(agentPosition);
    }
  }

  protected override onAwake(): void {
    super.onAwake();
    this._agentInstance = this._crowd.addAgent(this.gameObject.position, {
      radius: 0.5,
      height: 0.5,
      maxAcceleration: 4.0,
      maxSpeed: 1.0,
      collisionQueryRange: 0.5,
      pathOptimizationRange: 0.0,
      separationWeight: 1.0,
      ...this._options,
    });
  }

  private _logNoAgentError() {
    logger({
      message: 'NavMeshAgent instance not initialized yet.',
      type: 'error',
    });
  }
}
