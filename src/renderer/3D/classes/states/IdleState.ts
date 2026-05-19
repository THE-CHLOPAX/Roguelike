import { InputState } from '@tgdf';

import { State } from './State';
import { Animations } from '../../types';
import { Entity } from '../gameObjects/Entity';

export class IdleState extends State {
  constructor(public entity: Entity) {
    super(entity);
  }

  public override onEnter(): void {
    this.entity.animationController.playAnimation(Animations.IDLE, { loop: true });
  }

  public override onExit(): void {}

  public override onInput(_inputState: InputState): State {
    return this;
  }

  public override onUpdate(_deltaTime: number): State {
    return this;
  }
}
