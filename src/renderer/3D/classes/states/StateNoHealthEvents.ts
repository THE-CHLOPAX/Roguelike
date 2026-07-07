import { InputState } from '@tgdf';

import { State } from '.';
import { Entity } from '../gameObjects/Entity';

export abstract class StateNoHealthEvents extends State {
  constructor(public entity: Entity) {
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

  public abstract onEnter(): void;

  public abstract onExit(): void;

  public abstract onInput(_inputState: InputState): State;

  public abstract onUpdate(_deltaTime: number): State;
}
