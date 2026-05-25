import { InputState } from '@tgdf';

import { IdleState, RunningState, State } from '../index';
import { EntityMovable } from '../../gameObjects/EntityMovable';
import { ControlsState, mapInputToControls } from '../../../utils/mapInputToControls';

export class AttackState extends State {
  private _attackInProgress = false;
  private _controlState: ControlsState | null = null;

  constructor(public entity: EntityMovable) {
    super(entity);
  }

  public override onEnter(): void {
    if (this.entity.attackAction) {
      this._attackInProgress = true;
      this.entity.attackAction(this.entity).then(() => {
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
