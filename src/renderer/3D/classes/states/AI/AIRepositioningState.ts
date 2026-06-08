import { AIState } from './AIState';
import { AIIdleState } from './AIIdleState';
import { AIAttackState } from './AIAttackState';
import { Entity } from '../../gameObjects/Entity';
import { EntityAI } from '../../gameObjects/EntityAI';
import { getBestAttack } from './utils/getBestAttack';
import { getTargetEnemy } from './utils/getTargetEnemy';
import { AIAttackAction, AnimationClipNamesShared } from '../../../types';

/**
 * This state is responsible for repositioning the AI entity when it is too close to the
 * target to perform its most preferred attack. The entity will try to move away from the
 * target until it is at a distance that allows it to use its most preferred attack.
 */
export class AIRepositioningState extends AIState {
  public static checkCondition(entity: EntityAI, attack: AIAttackAction): boolean {
    // Check if there is a target enemy
    const targetEnemy = getTargetEnemy(entity);
    if (!targetEnemy) return false;

    // If entity is too close to the target enemy, it should reposition
    const distanceToEnemy = entity.position.distanceTo(targetEnemy.position);
    return distanceToEnemy < attack.minRange;
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
    const targetEnemy = getTargetEnemy(this.entity);
    if (targetEnemy === null) return new AIIdleState(this.entity);

    const bestAttack = getBestAttack(this.entity, targetEnemy);
    if (bestAttack === null) return new AIIdleState(this.entity);

    if (AIAttackState.checkCondition(this.entity, bestAttack)) {
      return new AIAttackState(this.entity);
    }

    // Move away from the target enemy
    this._moveAwayFromEnemy(targetEnemy);

    return this;
  }

  private _moveAwayFromEnemy(targetEnemy: Entity): void {
    const directionAwayFromEnemy = this.entity.position
      .clone()
      .sub(targetEnemy.position)
      .normalize();
    const repositionTarget = this.entity.position
      .clone()
      .add(directionAwayFromEnemy.multiplyScalar(1)); // Move 1 unit away from the enemy, you can adjust this value as needed

    this.entity.navMeshAgent.moveTo(repositionTarget, this.entity.defaultSpeed);
  }
}
