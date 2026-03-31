import { Scene } from '@tgdf';
import * as THREE from 'three';
import { Crowd, CrowdAgentParams } from '@recast-navigation/core';

import { NavMeshAgent } from '../gameObjectComponents/NavMeshAgent';
import { MovableRigidGameObject, MovableRigidGameObjectOptions } from './MovableRigidGameObject';

export type MovableRigidNavMeshGameObjectOptions = MovableRigidGameObjectOptions & {
  navMeshOptions?: Omit<Partial<CrowdAgentParams>, 'maxAcceleration' | 'maxSpeed'>;
};

export class MovableRigidNavMeshGameObject extends MovableRigidGameObject {
  private _navMeshAgent: NavMeshAgent;

  constructor(scene: Scene, options: MovableRigidNavMeshGameObjectOptions, crowd: Crowd) {
    super(scene, options);
    this._navMeshAgent = this.addComponent(
      'NavMeshAgent',
      new NavMeshAgent(this, crowd, options.navMeshOptions)
    );
  }

  public override move(direction: THREE.Vector3): void {
    if (this.movementDisabled) return;
    this._navMeshAgent.requestMoveVelocity(direction);
  }

  public override moveTo(target: THREE.Vector3): void {
    if (this.movementDisabled) return;
    this._navMeshAgent.requestMoveTarget(target);
  }

  public override resetMovementTarget(): void {
    this._navMeshAgent.resetMoveTarget();
  }

  public get navMeshAgent(): NavMeshAgent {
    return this._navMeshAgent;
  }

  protected override onUpdate(_deltaTime: number): void {
    super.onUpdate(_deltaTime);

    // Sync physics position to agent's internal position to prevent desync issues
    if (this._navMeshAgent) {
      const actualPos = this.position;
      const agentPos = this._navMeshAgent.position;

      actualPos.x = agentPos.x;
      actualPos.y = agentPos.y;
      actualPos.z = agentPos.z;
    }
  }
}
