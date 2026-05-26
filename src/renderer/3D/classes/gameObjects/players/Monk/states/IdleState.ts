import { InputState } from '@tgdf';

import { kick } from '../attacks';
import { State } from '../../../../states/State';
import { RunningState, AttackState } from './index';
import { EntityMovable } from '../../../EntityMovable';
import { AnimationClipNamesShared } from '../../../../../types';
import { mapInputToControls } from '../../../../../utils/mapInputToControls';

export class IdleState extends State {
  constructor(public entity: EntityMovable) {
    super(entity);
  }

  public override onEnter(): void {
    this.entity.animationController.playAnimation(AnimationClipNamesShared.IDLE, { loop: true });
  }

  public override onExit(): void {}

  public override onInput(inputState: InputState): State {
    const controlState = mapInputToControls(inputState);

    if (controlState.type === 'run' || controlState.type === 'sprint') {
      return new RunningState(this.entity);
    }

    if (controlState.type === 'action-up') {
      return new AttackState(this.entity, kick);
    }

    return this;
  }

  public override onUpdate(_deltaTime: number): State {
    return this;
  }
}
