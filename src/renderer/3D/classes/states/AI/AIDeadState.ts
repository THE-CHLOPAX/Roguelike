import { InputState, MAIN_SOUND_CHANNEL } from '@tgdf';

import { AIState } from './AIState';
import { EntityAI } from '../../gameObjects/EntityAI';
import { AnimationClipNamesShared } from '../../../types';
import { FMODAudio, FMODEventInstance, FMOD_EVENTS } from '../../../../FMOD';

export class AIDeadState extends AIState {
  private _eventInstance: FMODEventInstance | null = null;

  constructor(public entity: EntityAI) {
    super(entity);
  }
  public onEnter(): void {
    this._eventInstance = FMODAudio.playEventInSoundChannel({
      eventPath: FMOD_EVENTS.HURT,
      channelId: MAIN_SOUND_CHANNEL,
    });
    this.entity.animationController.playAnimation(AnimationClipNamesShared.FALL, {
      loop: false,
      clampWhenFinished: true,
      onComplete: () => {
        this.entity.destroy();
      },
    });
  }
  public onExit(): void {
    if (this._eventInstance === null) return;
    FMODAudio.stopEvent(this._eventInstance);
    this._eventInstance = null;
  }

  public onInput(_inputState: InputState): AIState {
    return this;
  }
  public onUpdate(_deltaTime: number): AIState {
    return this;
  }
}
