import { InputState, MAIN_SOUND_CHANNEL } from '@tgdf';

import { AIState } from './AIState';
import { AIDeadState } from './AIDeadState';
import { EntityAI } from '../../gameObjects/EntityAI';
import { AnimationClipNamesShared } from '../../../types';
import { AIStateNoHealthEvents } from './AIStateNoHealthEvents';
import { FMOD_EVENTS, FMODAudio, FMODEventInstance } from '../../../../FMOD';

export class AIHurtState extends AIStateNoHealthEvents {
  private _flashEnded: boolean = false;
  private _animationEnded: boolean = false;
  private _eventInstance: FMODEventInstance | null = null;

  constructor(
    public entity: EntityAI,
    public nextState: AIState
  ) {
    super(entity);
  }

  public onEnter(): void {
    this._eventInstance = FMODAudio.playEventInSoundChannel({
      eventPath: FMOD_EVENTS.HURT,
      channelId: MAIN_SOUND_CHANNEL,
    });

    this.entity.animationController.playAnimation(AnimationClipNamesShared.HIT, {
      loop: false,
      clampWhenFinished: true,
      onComplete: () => {
        this._animationEnded = true;
      },
    });
    this.entity.healthPointsController.flashRed(() => {
      this._flashEnded = true;
    });
  }

  public onExit(): void {
    // Restore original materials when exiting the hurt state
    this.entity.modelRenderer.restoreOriginalMaterials();
    if (this._eventInstance === null) return;
    FMODAudio.stopEvent(this._eventInstance);
    this._eventInstance = null;
  }

  public onInput(_inputState: InputState): AIState {
    return this;
  }

  public onUpdate(_deltaTime: number): AIState {
    if (this.entity.healthPointsController.isDead) {
      return new AIDeadState(this.entity);
    }

    // Exit hurt state when both the flash and hit animation have ended
    if (this._flashEnded && this._animationEnded) {
      return this.nextState;
    }

    return this;
  }
}
