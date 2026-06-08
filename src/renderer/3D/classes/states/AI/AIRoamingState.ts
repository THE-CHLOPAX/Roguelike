import { InputState } from '@tgdf';

import { AIState } from './AIState';
import { AIIdleState } from './AIIdleState';
import { AIAttackState } from './AIAttackState';
import { AIChasingState } from './AIChasingState';
import { EntityAI } from '../../gameObjects/EntityAI';
import { getBestAttack } from './utils/getBestAttack';
import { getTargetEnemy } from './utils/getTargetEnemy';
import { AnimationClipNamesShared } from '../../../types';
import { AIRepositioningState } from './AIRepositioningState';
import { getRandomNavMeshPointInRadius } from '../../../utils/getRandomNavMeshPointInRadius';

export class AIRoamingState extends AIState {
  private _shouldTransitionToIdle: boolean = false;

  constructor(public entity: EntityAI) {
    super(entity);
  }

  public override onEnter(): void {
    this.entity.animationController.playAnimation(AnimationClipNamesShared.WALK, {
      loop: true,
    });
    this._roamToRandomPoint().finally(() => {
      this._shouldTransitionToIdle = true; // After roaming to a random point, transition back to idle
    });
  }
  public override onExit(): void {
    this.entity.navMeshAgent.resetMovementTarget();
  }

  public override onInput(_inputState: InputState): AIState {
    return this;
  }

  public override onUpdate(_deltaTime: number): AIState {
    const targetEnemy = getTargetEnemy(this.entity);

    let bestAttack = null;
    if (targetEnemy) {
      bestAttack = getBestAttack(this.entity, targetEnemy);
    }

    if (bestAttack === null) {
      if (this._shouldTransitionToIdle) {
        this._shouldTransitionToIdle = false;
        return new AIIdleState(this.entity);
      }
      return this;
    }

    if (AIChasingState.checkCondition(this.entity, bestAttack)) {
      return new AIChasingState(this.entity);
    }

    if (AIRepositioningState.checkCondition(this.entity, bestAttack)) {
      return new AIRepositioningState(this.entity);
    }

    if (AIAttackState.checkCondition(this.entity, bestAttack)) {
      return new AIAttackState(this.entity);
    }

    if (this._shouldTransitionToIdle) {
      this._shouldTransitionToIdle = false;
      return new AIIdleState(this.entity);
    }
    return this;
  }

  private _roamToRandomPoint(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.entity.roaming) {
        reject(new Error('Entity roaming options are not defined'));
        return;
      }

      const navMeshAgent = this.entity.navMeshAgent;
      const navMesh = this.entity.navMesh;

      const randomNavMeshPoint = getRandomNavMeshPointInRadius(
        navMesh,
        this.entity.spawnPosition,
        this.entity.roaming.radius
      );

      if (!randomNavMeshPoint) {
        reject(new Error('Failed to find a random point on the NavMesh'));
        return;
      }

      navMeshAgent
        .moveTo(randomNavMeshPoint, this.entity.walkSpeed)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
