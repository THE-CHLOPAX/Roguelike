import { InputState } from '@tgdf';

import { State, StateWithHealthEvents } from '..';
import { Player } from '../../gameObjects/players/Player';
import { AnimationClipNamesShared } from '../../../types';
import { mapInputToControls } from '../../../utils/mapInputToControls';

export class IdleState extends StateWithHealthEvents {
  constructor(public entity: Player) {
    super(entity);
  }

  public override onEnter(): void {
    this.entity.animationController.playAnimation(AnimationClipNamesShared.IDLE, { loop: true });
  }

  public override onExit(): void {}

  public override onInput(inputState: InputState): State {
    const controlState = mapInputToControls(inputState);

    const newState = this.entity.onAction(controlState.type);

    return newState ?? this;
  }

  public override onUpdate(_deltaTime: number): State {
    return this;
  }

  protected override recreateInstance(): IdleState {
    return new IdleState(this.entity);
  }
}
