import { InputState } from '@tgdf';

import { Entity } from '../../../Entity';
import { State } from '../../../../states';
import { IdleState, RunningState } from './index';
import { AnimationClipNamesShared } from '../../../../../types';
import { mapInputToControls } from '../../../../../utils/mapInputToControls';

export class SprintingState extends RunningState {
  constructor(public entity: Entity) {
    super(entity);
  }

  public override onEnter(): void {
    this.entity.animationController.playAnimation(AnimationClipNamesShared.SPRINT, { loop: true });
    this.entity.movementController.toggleSprint(true);
  }

  public override onExit(): void {
    this.entity.movementController.toggleSprint(false);
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
