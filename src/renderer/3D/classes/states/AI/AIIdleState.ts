import { IdleState, State } from '../index';
import { EntityMovable } from '../../gameObjects/EntityMovable';

export class AIIdleState extends IdleState {
  constructor(public entity: EntityMovable) {
    super(entity);
  }

  public override onInput(): State {
    // AI should ignore player input, so we simply return the current state
    return this;
  }
}
