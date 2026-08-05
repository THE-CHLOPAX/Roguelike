import { InputState, MAIN_SOUND_CHANNEL } from '@tgdf';

import { State, DeadState } from '.';
import { Entity } from '../gameObjects/Entity';
import { AnimationClipNamesShared } from '../../types';
import { FMOD_EVENTS, FMODAudio, FMODEventInstance } from '../../../FMOD';

export class HurtState extends State {
  private _flashEnded: boolean = false;
  private _animationEnded: boolean = false;
  private _eventInstance: FMODEventInstance | null = null;

  constructor(
    public entity: Entity,
    public nextState: State
  ) {
    super(entity);
  }

  protected override get isDamageImmune(): boolean {
    return true;
  }

  protected override onDamageTaken(): State | null {
    return null;
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
