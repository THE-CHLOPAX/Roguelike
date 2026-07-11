import { GameObjectComponent, InputState } from '@tgdf';

import { State } from '../../classes/states';
import { Entity } from '../gameObjects/Entity';

export class StateController extends GameObjectComponent {
  constructor(gameObject: Entity) {
    super(gameObject);
  }

  public override get gameObject(): Entity {
    return super.gameObject as Entity;
  }

  private _currentState: State | null = null;

  public get currentState(): State | null {
    return this._currentState;
  }

  public set currentState(newState: State | null) {
    if (this._currentState) {
      this._currentState.exit();
    }
    this._currentState = newState;
    if (this._currentState) {
      this._currentState.enter();
    }
  }

  protected override onInput(_inputState: InputState): void {
    if (this._currentState) {
      const newState = this._currentState.input(_inputState);
      if (newState !== this._currentState) {
        this.currentState = newState;
      }
    }
  }

  public override onUpdate(deltaTime: number): void {
    if (this._currentState) {
      const newState = this._currentState.update(deltaTime);
      if (newState !== this._currentState) {
        this.currentState = newState;
      }
    }
  }

  public override onDestroyed(): void {
    this._currentState = null;
    super.onDestroyed();
  }
}
