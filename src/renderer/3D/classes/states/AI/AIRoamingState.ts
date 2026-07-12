import { InputState, logger } from '@tgdf';

import { EntityAI } from '../../gameObjects/EntityAI';
import { getBestAttack } from './utils/getBestAttack';
import { getTargetEnemy } from './utils/getTargetEnemy';
import { AnimationClipNamesShared } from '../../../types';
import { State, AIIdleState, AIAttackState, AIChasingState } from '..';
import { getRandomNavMeshPointInRadius } from '../../../utils/getRandomNavMeshPointInRadius';

export class AIRoamingState extends State {
  private _shouldTransitionToIdle: boolean = false;

  constructor(public entity: EntityAI) {
    super(entity);
  }

  public override onEnter(): void {
    this.entity.animationController.playAnimation(AnimationClipNamesShared.WALK, {
      loop: true,
    });
    this._roamToRandomPoint()
      .catch((error) => {
        logger({ message: error.message, type: 'error' });
        this._shouldTransitionToIdle = true;
      })
      .finally(() => {
        this._shouldTransitionToIdle = true; // After roaming to a random point, transition back to idle
      });
  }
  public override onExit(): void {
    this.entity.movementController.resetMoveTo();
  }

  public override onInput(_inputState: InputState): State {
    return this;
  }

  public override onUpdate(_deltaTime: number): State {
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

      const path = this.entity.navMeshAgent.calculatePath(randomNavMeshPoint);
      if (path === null) {
        reject(new Error('Failed to calculate path to target'));
        return;
      }

      this.entity.movementController
        .moveAlongPath(path, this.entity.walkSpeed)
        .then(() => resolve())
        .catch(() => {});
    });
  }
}
