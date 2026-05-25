import { InputState } from '@tgdf';

import { Animations } from '../../../types';
import { State, RunningState, AttackState } from '../index';
import { EntityMovable } from '../../gameObjects/EntityMovable';
import { mapInputToControls } from '../../../utils/mapInputToControls';

export class IdleState extends State {
  constructor(public entity: EntityMovable) {
    super(entity);
  }

  public override onEnter(): void {
    this.entity.animationController.playAnimation(Animations.IDLE, { loop: true });
  }

  public override onExit(): void {}

  public override onInput(inputState: InputState): State {
    const controlState = mapInputToControls(inputState);

    if (controlState === 'run' || controlState === 'sprint') {
      return new RunningState(this.entity);
    }

    if (controlState === 'attack') {
      return new AttackState(this.entity);
    }

    return this;
  }

  public override onUpdate(_deltaTime: number): State {
    return this;
  }
}
