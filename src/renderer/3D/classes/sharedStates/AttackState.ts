import { InputState } from '@tgdf';

import { IdleState } from '.';
import { State } from './State';
import { AttackAction } from '../../types';
import { RunningState } from './RunningState';
import { EntityMovable } from '../gameObjects/EntityMovable';
import { ControlsState, mapInputToControls } from '../../utils/mapInputToControls';

export class AttackState extends State {
  private _attackInProgress = false;
  private _controlState: ControlsState | null = null;

  constructor(
    public entity: EntityMovable,
    private _attackAction?: AttackAction
  ) {
    super(entity);
  }

  public override onEnter(): void {
    if (this._attackAction) {
      this._attackInProgress = true;
      this._attackAction(this.entity).then(() => {
        this._attackInProgress = false;
      });
    }
  }

  public override onExit(): void {}

  public override onInput(inputState: InputState): State {
    this._controlState = mapInputToControls(inputState);
    return this;
  }

  public override onUpdate(_deltaTime: number): State {
    if (!this._attackInProgress && this._controlState === null) {
      return new IdleState(this.entity, this._attackAction);
    }

    if (
      !this._attackInProgress &&
      (this._controlState === 'run' || this._controlState === 'sprint')
    ) {
      return new RunningState(this.entity);
    }

    return this;
  }
}
