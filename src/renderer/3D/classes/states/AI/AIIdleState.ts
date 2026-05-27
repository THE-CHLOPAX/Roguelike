import { randFromRange } from '@tgdf';

import { AIState, AIStateOptions } from '../index';
import { AnimationClipNamesShared } from '../../../types';
import { EntityMovable } from '../../gameObjects/EntityMovable';
import { AIRoamingState, RoamingOptions } from './AIRoamingState';

export type AIIdleStateOptions = AIStateOptions & {
  roaming?: RoamingOptions;
};

export class AIIdleState extends AIState {
  private _startRoamingTimeout: NodeJS.Timeout | null = null;
  private _shouldTransitionToRoaming: boolean = false;

  constructor(
    public entity: EntityMovable,
    protected options: AIIdleStateOptions
  ) {
    super(entity, options);
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
      return new AIRoamingState(this.entity, { ...this.options, ...this.options.roaming });
    }
    return this;
  }
}
