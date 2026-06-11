import { AIState } from './AIState';
import { AIHurtState } from './AIHurtState';
import { EntityAI } from '../../gameObjects/EntityAI';

export abstract class AIStateWithHealthEvents extends AIState {
  constructor(public entity: EntityAI) {
    super(entity);
  }

  public override enter(): void {
    this.entity.healthPointsController.events.on('damagetaken', this._onDamageTaken);
    this.onEnter();
  }

  public override exit(): void {
    this.entity.healthPointsController.events.off('damagetaken', this._onDamageTaken);
    this.onExit();
  }

  public abstract onExit(): void;

  public abstract onEnter(): void;

  public abstract onUpdate(deltaTime: number): AIState;

  private _onDamageTaken = () => {
    this.entity.stateController.currentState = new AIHurtState(this.entity, this);
  };
}
