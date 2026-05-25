import { InputState } from '@tgdf';

import { Animations, AttackAction } from '../../types';
import { State, RunningState, AttackState } from './index';
import { EntityMovable } from '../gameObjects/EntityMovable';
import { mapInputToControls } from '../../utils/mapInputToControls';

export class IdleState extends State {
  private _attackAction?: AttackAction;

  constructor(
    public entity: EntityMovable,
    attackAction?: AttackAction
  ) {
    super(entity);
    this._attackAction = attackAction;
  }

  public override onEnter(): void {
    this.entity.animationController.playAnimation(Animations.IDLE, { loop: true });
  }

  public override onExit(): void {}

  public override onInput(inputState: InputState): State {
    const controlState = mapInputToControls(inputState);

    console.log('IdleState received input, mapped to control state:', controlState);

    if (controlState === 'run' || controlState === 'sprint') {
      return new RunningState(this.entity);
    }

    if (controlState === 'attack') {
      return new AttackState(this.entity, this._attackAction);
    }

    return this;
  }

  public override onUpdate(_deltaTime: number): State {
    return this;
  }
}
