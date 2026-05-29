import { InputState } from '@tgdf';

import { State } from '../State';
import { EntityAI } from '../../gameObjects/EntityAI';

export abstract class AIState extends State {
  constructor(public entity: EntityAI) {
    super(entity);
  }

  public abstract onEnter(): void;
  public abstract onExit(): void;
  public onInput(_inputState: InputState): AIState {
    // AI should ignore player input, so we simply return the current state
    return this;
  }
  public abstract onUpdate(deltaTime: number): AIState;
}
