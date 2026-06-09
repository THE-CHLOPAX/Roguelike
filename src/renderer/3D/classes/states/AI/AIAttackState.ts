import { AIAttackAction } from 'src/renderer/3D/types';

import { AIState } from './AIState';
import { AIIdleState } from './AIIdleState';
import { AIChasingState } from './AIChasingState';
import { EntityAI } from '../../gameObjects/EntityAI';
import { getBestAttack } from './utils/getBestAttack';
import { getTargetEnemy } from './utils/getTargetEnemy';

export class AIAttackState extends AIState {
  private _isAttacking: boolean = false;

  public static checkCondition(entity: EntityAI, attack: AIAttackAction): boolean {
    // Check if there's a target enemy
    const targetEnemy = getTargetEnemy(entity);
    if (!targetEnemy) return false;

    // If entity is in range to perform its most preferred attack, it should attack
    const distanceToEnemy = entity.position.distanceTo(targetEnemy.position);
    return distanceToEnemy >= attack.minRange && distanceToEnemy <= attack.maxRange;
  }

  constructor(public entity: EntityAI) {
    super(entity);
  }

  public onEnter(): void {}

  public onExit(): void {}

  public override onUpdate(_deltaTime: number): AIState {
    // If currently performing an attack, do not transition to another state until the attack is finished
    if (this._isAttacking) return this;

    const targetEnemy = getTargetEnemy(this.entity);
    if (targetEnemy === null) return new AIIdleState(this.entity);

    const bestAttack = getBestAttack(this.entity, targetEnemy);
    if (bestAttack === null) return new AIIdleState(this.entity);

    if (AIChasingState.checkCondition(this.entity, bestAttack)) {
      return new AIChasingState(this.entity);
    }

    // If no transition conditions are met, perform the attack
    this._performAttack(bestAttack);

    return this;
  }

  private _performAttack(bestAttack: AIAttackAction): void {
    this._isAttacking = true;
    bestAttack.action(this.entity).then(() => {
      this._isAttacking = false;
    });
  }
}
