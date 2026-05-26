import { State } from '../index';
import { AnimationClipNamesShared } from '../../../types';
import { EntityMovable } from '../../gameObjects/EntityMovable';

export class AIIdleState extends State {
  constructor(public entity: EntityMovable) {
    super(entity);
  }

  public override onInput(): State {
    // AI should ignore player input, so we simply return the current state
    return this;
  }

  public override onEnter(): void {
    this.entity.animationController.playAnimation(AnimationClipNamesShared.IDLE, { loop: true });
  }

  public override onExit(): void {}

  public override onUpdate(_deltaTime: number): State {
    return this;
  }
}
