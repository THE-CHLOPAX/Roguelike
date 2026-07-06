import { InputState } from '@tgdf';

import { State, HurtState } from '.';
import { Entity } from '../gameObjects/Entity';

export abstract class StateWithHealthEvents extends State {
  constructor(public entity: Entity) {
    super(entity);
  }

  public override enter(): void {
    this.entity.healthPointsController.isImmuneToDamage = false;
    this.entity.healthPointsController.events.on('damagetaken', this._onDamageTaken);
    this.onEnter();
  }

  public override exit(): void {
    this.entity.healthPointsController.events.off('damagetaken', this._onDamageTaken);
    this.onExit();
  }

  public abstract onEnter(): void;

  public abstract onExit(): void;

  public abstract onInput(_inputState: InputState): State;

  public abstract onUpdate(_deltaTime: number): State;

  protected abstract recreateInstance(): StateWithHealthEvents;

  private _onDamageTaken = () => {
    this.entity.stateController.currentState = new HurtState(this.entity, this.recreateInstance());
  };
}
