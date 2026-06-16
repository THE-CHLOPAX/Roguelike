import { InputState } from '@tgdf';

import { AIState } from './AIState';
import { EntityAI } from '../../gameObjects/EntityAI';
import { AnimationClipNamesShared } from '../../../types';

export class AIDeadState extends AIState {
  constructor(public entity: EntityAI) {
    super(entity);
  }
  public onEnter(): void {
    this.entity.animationController.playAnimation(AnimationClipNamesShared.FALL, {
      loop: false,
      clampWhenFinished: true,
      onComplete: () => {
        this.entity.destroy();
      },
    });
    // Remove the damage hitbox when the entity dies
    this.entity.damageHitboxController.removeDamageHitbox();
  }
  public onExit(): void {}

  public onInput(_inputState: InputState): AIState {
    return this;
  }
  public onUpdate(_deltaTime: number): AIState {
    return this;
  }
}
