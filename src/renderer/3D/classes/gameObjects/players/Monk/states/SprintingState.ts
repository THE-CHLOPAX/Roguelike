import { InputState } from '@tgdf';

import { State } from '../../../../states/State';
import { IdleState, RunningState } from './index';
import { EntityMovable } from '../../../EntityMovable';
import { AnimationClipNamesShared } from '../../../../../types';
import { mapInputToControls } from '../../../../../utils/mapInputToControls';

export class SprintingState extends RunningState {
  constructor(public entity: EntityMovable) {
    super(entity);
  }

  public override onEnter(): void {
    this.entity.animationController.playAnimation(AnimationClipNamesShared.SPRINT, { loop: true });
    this.entity.toggleSprint(true);
  }

  public override onExit(): void {
    this.entity.toggleSprint(false);
  }

  public override onInput(inputState: InputState): State {
    const controlState = mapInputToControls(inputState);

    if (controlState.type === 'idle') {
      return new IdleState(this.entity);
    }

    if (controlState.type === 'run') {
      return new RunningState(this.entity);
    }

    return this;
  }
}
