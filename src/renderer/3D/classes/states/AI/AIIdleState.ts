import { randFromRange } from '@tgdf';

import { AIState } from '../index';
import { EntityAI } from '../../gameObjects/EntityAI';
import { AnimationClipNamesShared } from '../../../types';
import { AIRoamingState, AIRoamingStateOptions } from './AIRoamingState';

export type AIIdleStateOptions = {
  roaming?: AIRoamingStateOptions;
};

export class AIIdleState extends AIState {
  private _startRoamingTimeout: NodeJS.Timeout | null = null;
  private _shouldTransitionToRoaming: boolean = false;

  constructor(
    public entity: EntityAI,
    protected options: AIIdleStateOptions
  ) {
    super(entity);
  }

  public override onEnter(): void {
    this.entity.animationController.playAnimation(AnimationClipNamesShared.IDLE, { loop: true });

    if (this.options?.roaming) {
      const interval = this.options.roaming.interval;
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
    if (this._shouldTransitionToRoaming && this.options?.roaming) {
      this._shouldTransitionToRoaming = false;
      return new AIRoamingState(this.entity, this.options.roaming);
    }
    return this;
  }
}
