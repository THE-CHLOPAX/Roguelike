import { AIState } from './AIState';
import { AIIdleState } from './AIIdleState';
import { EntityAI } from '../../gameObjects/EntityAI';
import { AnimationClipNamesShared } from '../../../types';

export class AIChasingState extends AIState {
  public static checkCondition(entity: EntityAI): boolean {
    // Check if any enemies are in range to chase
    return entity.enemiesInRange.length > 0;
  }

  constructor(public entity: EntityAI) {
    super(entity);
  }

  public onEnter(): void {
    this.entity.animationController.playAnimation(AnimationClipNamesShared.RUN, {
      loop: true,
    });
  }

  public onExit(): void {
    this.entity.navMeshAgent.resetMovementTarget();
  }

  public onUpdate(_deltaTime: number): AIState {
    if (!AIChasingState.checkCondition(this.entity)) {
      // If no enemies are in range, transition back to idle
      return new AIIdleState(this.entity);
    }

    // Is it always the closest?
    const targetEnemy = this.entity.enemiesInRange[0];
    this.entity.navMeshAgent.moveTo(targetEnemy.position, this.entity.defaultSpeed);

    return this;
  }
}
