import { assert, InputState, MAIN_SOUND_CHANNEL } from '@tgdf';

import { State } from './State';
import { DeadState } from './DeadState';
import { Entity } from '../gameObjects/Entity';
import { FMOD_EVENTS, FMODAudio } from '../../../FMOD';
import { AnimationClipNamesShared } from '../../types';
import { StateNoHealthEvents } from './StateNoHealthEvents';

export class HurtState extends StateNoHealthEvents {
  private _flashEnded: boolean = false;
  private _animationEnded: boolean = false;

  constructor(
    public entity: Entity,
    public nextState: State
  ) {
    super(entity);
  }

  public onEnter(): void {
    const eventInstance = FMODAudio.playEventInSoundChannel({
      eventPath: FMOD_EVENTS.HURT,
      channelId: MAIN_SOUND_CHANNEL,
    });
    assert(eventInstance !== null);

    this.entity.animationController.playAnimation(AnimationClipNamesShared.HIT, {
      loop: false,
      clampWhenFinished: true,
      onComplete: () => {
        this._animationEnded = true;
        FMODAudio.stopEvent(eventInstance);
      },
    });
    this.entity.healthPointsController.flashRed(() => {
      this._flashEnded = true;
    });
  }

  public onExit(): void {
    // Restore original materials when exiting the hurt state
    this.entity.modelRenderer.restoreOriginalMaterials();
  }

  public onInput(_inputState: InputState): State {
    return this;
  }

  public onUpdate(_deltaTime: number): State {
    if (this.entity.healthPointsController.isDead) {
      return new DeadState(this.entity);
    }

    // Exit hurt state when both the flash and hit animation have ended
    if (this._flashEnded && this._animationEnded) {
      return this.nextState;
    }

    return this;
  }
}
