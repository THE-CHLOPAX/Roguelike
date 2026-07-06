import { InputState } from '@tgdf';

import { kick } from '../attacks';
import { Entity } from '../../../Entity';
import { RunningState, AttackState } from './index';
import { AnimationClipNamesShared } from '../../../../../types';
import { State, StateWithHealthEvents } from '../../../../states';
import { mapInputToControls } from '../../../../../utils/mapInputToControls';

export class IdleState extends StateWithHealthEvents {
  constructor(public entity: Entity) {
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
