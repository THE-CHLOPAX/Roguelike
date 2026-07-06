import { InputState, MAIN_SOUND_CHANNEL } from '@tgdf';

import { IdleState, RunningState } from './index';
import { AttackAction } from '../../../../../types';
import { EntityMovable } from '../../../EntityMovable';
import { State, StateWithHealthEvents } from '../../../../states';
import { FMOD_EVENTS, FMODAudio, FMODEventInstance } from '../../../../../../FMOD';
import { ControlsState, mapInputToControls } from '../../../../../utils/mapInputToControls';

export class AttackState extends StateWithHealthEvents {
  private _attackInProgress = false;
  private _controlState: ControlsState | null = null;
  private _eventInstance: FMODEventInstance | null = null;

  constructor(
    public entity: EntityMovable,
    private _attackAction: AttackAction
  ) {
    super(entity);
  }

  public override onEnter(): void {
    this._eventInstance = FMODAudio.playEventInSoundChannel({
      eventPath: FMOD_EVENTS.ATTACK,
      channelId: MAIN_SOUND_CHANNEL,
    });

    this._attackInProgress = true;

    this._attackAction(this.entity).then(() => {
      this._attackInProgress = false;
    });
  }

  public override onExit(): void {
    if (this._eventInstance === null) return;
    FMODAudio.stopEvent(this._eventInstance);
    this._eventInstance = null;
  }

  public override onInput(inputState: InputState): State {
    this._controlState = mapInputToControls(inputState);
    return this;
  }

  public override onUpdate(_deltaTime: number): State {
    if (!this._attackInProgress && this._controlState?.type === 'idle') {
      return new IdleState(this.entity);
    }

    if (
      !this._attackInProgress &&
      (this._controlState?.type === 'run' || this._controlState?.type === 'sprint')
    ) {
      return new RunningState(this.entity);
    }

    return this;
  }
}
