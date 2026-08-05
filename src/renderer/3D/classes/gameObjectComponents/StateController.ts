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
  private _pendingState: State | null = null;

  public get currentState(): State | null {
    return this._currentState;
  }

  public set currentState(newState: State | null) {
    // Any explicit transition invalidates a reaction queued by the previous state
    this._pendingState = null;
    if (this._currentState) {
      this._currentState.exit();
    }
    this._currentState = newState;
    if (this._currentState) {
      this._currentState.enter();
    }
  }

  /**
   * Queues a transition triggered outside the input/update flow (e.g. from an
   * event handler), so states never get swapped mid-frame.
   */
  public requestTransition(newState: State): void {
    this._pendingState = newState;
  }

  protected override onInput(_inputState: InputState): void {
    this._applyPendingState();
    if (this._currentState) {
      const newState = this._currentState.input(_inputState);
      if (newState !== this._currentState) {
        this.currentState = newState;
      }
    }
  }

  public override onUpdate(deltaTime: number): void {
    this._applyPendingState();
    if (this._currentState) {
      const newState = this._currentState.update(deltaTime);
      if (newState !== this._currentState) {
        this.currentState = newState;
      }
    }
  }

  public override onDestroyed(): void {
    this._pendingState = null;
    this._currentState = null;
    super.onDestroyed();
  }

  private _applyPendingState(): void {
    const pendingState = this._pendingState;
    if (pendingState) {
      this.currentState = pendingState;
    }
  }
}
