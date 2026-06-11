import { InputState } from '@tgdf';

import { IdleState, RunningState } from './index';
import { AttackAction } from '../../../../../types';
import { EntityMovable } from '../../../EntityMovable';
import { State, StateWithHealthEvents } from '../../../../states';
import { ControlsState, mapInputToControls } from '../../../../../utils/mapInputToControls';

export class AttackState extends StateWithHealthEvents {
  private _attackInProgress = false;
  private _controlState: ControlsState | null = null;

  constructor(
    public entity: EntityMovable,
    private _attackAction: AttackAction
  ) {
    super(entity);
  }

  public override onEnter(): void {
    this._attackInProgress = true;
    this._attackAction(this.entity).then(() => {
      this._attackInProgress = false;
    });
  }

  public override onExit(): void {}

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
