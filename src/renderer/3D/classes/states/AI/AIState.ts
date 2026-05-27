import { InputState } from '@tgdf';
import { NavMesh } from '@recast-navigation/core';

import { State } from '../State';
import { EntityMovable } from '../../gameObjects/EntityMovable';
import { NavMeshAgent } from '../../gameObjectComponents/NavMeshAgent';

export type AIStateOptions = {
  navMeshAgent: NavMeshAgent;
  navMesh: NavMesh;
};

export abstract class AIState extends State {
  constructor(
    public entity: EntityMovable,
    protected options: AIStateOptions
  ) {
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
