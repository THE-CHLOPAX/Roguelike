import { GameObject, GameObjectComponent } from '@tgdf';

declare module '@tgdf' {
  export interface GameObjectEventMap {
    'state:statechange': { newState: unknown; previousState: unknown };
  }
}

export class StateController<T> extends GameObjectComponent {
  private _currentState: T | null = null;
  private _previousState: T | null = null;

  constructor(gameObject: GameObject, options: { initialState: T }) {
    super(gameObject);
    this._currentState = options.initialState;
  }

  public setState(newState: T): void {
    if (this._currentState === newState) return;

    this._previousState = this._currentState;
    this._currentState = newState;
    this.gameObject.events.trigger('state:statechange', {
      newState,
      previousState: this._previousState,
    });
  }
}
