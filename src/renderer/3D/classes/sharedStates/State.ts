import { InputState } from '@tgdf';

import { Entity } from '../gameObjects/Entity';

export abstract class State {
  constructor(public entity: Entity) {}

  public abstract onEnter(): void;

  public abstract onExit(): void;

  public abstract onInput(inputState: InputState): State;

  public abstract onUpdate(deltaTime: number): State;
}
