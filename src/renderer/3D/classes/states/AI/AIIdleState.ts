import { randFromRange } from '@tgdf';

import { AIState } from '../index';
import { AIAttackState } from './AIAttackState';
import { AIRoamingState } from './AIRoamingState';
import { AIChasingState } from './AIChasingState';
import { EntityAI } from '../../gameObjects/EntityAI';
import { getBestAttack } from './utils/getBestAttack';
import { getTargetEnemy } from './utils/getTargetEnemy';
import { AnimationClipNamesShared } from '../../../types';

export class AIIdleState extends AIState {
  private _startRoamingTimeout: NodeJS.Timeout | null = null;
  private _shouldTransitionToRoaming: boolean = false;

  constructor(public entity: EntityAI) {
    super(entity);
  }

  public override onEnter(): void {
    this.entity.animationController.playAnimation(AnimationClipNamesShared.IDLE, { loop: true });

    if (this.entity.roaming) {
      const interval = this.entity.roaming.interval;
      this._startRoamingTimeout = setTimeout(
        () => {
          this._shouldTransitionToRoaming = true;
        },
        randFromRange(interval.min, interval.max)
      );
    }
  }

  public override onExit(): void {
    if (this._startRoamingTimeout) {
      clearTimeout(this._startRoamingTimeout);
      this._startRoamingTimeout = null;
    }
  }

  public override onUpdate(_deltaTime: number): AIState {
    const targetEnemy = getTargetEnemy(this.entity);
    let bestAttack = null;

    if (targetEnemy) {
      bestAttack = getBestAttack(this.entity, targetEnemy);
    }

    if (!bestAttack) {
      if (this._shouldTransitionToRoaming && this.entity.roaming) {
        this._shouldTransitionToRoaming = false;
        return new AIRoamingState(this.entity);
      }
      return this;
    }

    if (AIChasingState.checkCondition(this.entity, bestAttack)) {
      return new AIChasingState(this.entity);
    }

    if (AIAttackState.checkCondition(this.entity, bestAttack)) {
      return new AIAttackState(this.entity);
    }

    if (this._shouldTransitionToRoaming && this.entity.roaming) {
      this._shouldTransitionToRoaming = false;
      return new AIRoamingState(this.entity);
    }
    return this;
  }
}
