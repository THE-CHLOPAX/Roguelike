import { AIState } from './AIState';
import { AIIdleState } from './AIIdleState';
import { AIAttackState } from './AIAttackState';
import { EntityAI } from '../../gameObjects/EntityAI';
import { getBestAttack } from './utils/getBestAttack';
import { getTargetEnemy } from './utils/getTargetEnemy';
import { AIStateWithHealthEvents } from './AIStateWithHealthEvents';
import { AIAttackAction, AnimationClipNamesShared } from '../../../types';

export class AIChasingState extends AIStateWithHealthEvents {
  public static checkCondition(entity: EntityAI, attack: AIAttackAction): boolean {
    // Check if there is a target enemy
    const targetEnemy = getTargetEnemy(entity);
    if (!targetEnemy) return false;

    // If entity is too far from the target enemy, it should chase it
    const distanceToEnemy = entity.position.distanceTo(targetEnemy.position);
    return distanceToEnemy > attack.maxRange;
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
    // If no enemies are in range, transition back to idle
    const targetEnemy = getTargetEnemy(this.entity);
    if (targetEnemy === null) return new AIIdleState(this.entity);

    const bestAttack = getBestAttack(this.entity, targetEnemy);
    if (bestAttack === null) return new AIIdleState(this.entity);

    if (bestAttack && AIAttackState.checkCondition(this.entity, bestAttack)) {
      return new AIAttackState(this.entity);
    }

    this.entity.navMeshAgent.setDestination(
      targetEnemy.position,
      this.entity.movementController.defaultSpeed
    );

    return this;
  }
}
