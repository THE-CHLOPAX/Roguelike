import { InputState } from '@tgdf';

import { State } from './State';
import { Entity } from '../gameObjects/Entity';
import { AnimationClipNamesShared } from '../../types';

export class DeadState extends State {
  constructor(public entity: Entity) {
    super(entity);
  }
  public onEnter(): void {
    this.entity.animationController.playAnimation(AnimationClipNamesShared.FALL, {
      loop: false,
      clampWhenFinished: true,
    });
  }
  public onExit(): void {}

  public onInput(_inputState: InputState): State {
    return this;
  }
  public onUpdate(_deltaTime: number): State {
    return this;
  }
}
