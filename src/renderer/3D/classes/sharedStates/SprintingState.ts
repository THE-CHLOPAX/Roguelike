import { InputState } from '@tgdf';

import { Animations } from '../../types';
import { State, IdleState } from './index';
import { RunningState } from './RunningState';
import { EntityMovable } from '../gameObjects/EntityMovable';
import { mapInputToControls } from '../../utils/mapInputToControls';

export class SprintingState extends RunningState {
  constructor(public entity: EntityMovable) {
    super(entity);
  }

  public override onEnter(): void {
    this.entity.animationController.playAnimation(Animations.SPRINTING, { loop: true });
    this.entity.toggleSprint(true);
  }

  public override onExit(): void {
    this.entity.toggleSprint(false);
  }

  public override onInput(inputState: InputState): State {
    const controlState = mapInputToControls(inputState);

    if (controlState === null) {
      return new IdleState(this.entity);
    }

    if (controlState === 'run') {
      return new RunningState(this.entity);
    }

    return this;
  }
}
