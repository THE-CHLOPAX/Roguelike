import { AIState } from './AIState';
import { EntityAI } from '../../gameObjects/EntityAI';

export abstract class AIStateNoHealthEvents extends AIState {
  constructor(public entity: EntityAI) {
    super(entity);
  }

  public override enter(): void {
    this.entity.healthPointsController.isImmuneToDamage = true;
    this.onEnter();
  }

  public override exit(): void {
    this.entity.healthPointsController.isImmuneToDamage = false;
    this.onExit();
  }

  public abstract onExit(): void;

  public abstract onEnter(): void;

  public abstract onUpdate(deltaTime: number): AIState;
}
