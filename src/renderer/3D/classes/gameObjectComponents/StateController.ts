import { GameObject, GameObjectComponent, logger } from '@tgdf';

import { StateConfig } from '../../types';

declare module '@tgdf' {
  export interface GameObjectEventMap<T = unknown> {
    'state:statechange': { newState: T; previousState: T };
  }
}

export class StateController<T extends string | number | symbol> extends GameObjectComponent {
  private _currentState: T | null = null;
  private _previousState: T | null = null;
  private _stateConfig?: Record<T, StateConfig<T>>;

  constructor(
    gameObject: GameObject,
    options: { initialState: T; stateConfig?: Record<T, StateConfig<T>> }
  ) {
    super(gameObject);
    this._stateConfig = options.stateConfig;
    this.setState(options.initialState);
  }

  public setState(newState: T): void {
    if (this._currentState === newState) return;

    // Validate transition if state machine is configured
    if (this._stateConfig && this._currentState !== null) {
      if (!this.canTransition(this._currentState, newState)) {
        logger({
          message:
            '[StateController] Invalid state transition: ' +
            `${String(this._currentState)} -> ${String(newState)}`,
          type: 'warn',
        });
        return;
      }
    }

    this._previousState = this._currentState;
    this._currentState = newState;
    this.gameObject.events.trigger('state:statechange', {
      newState,
      previousState: this._previousState,
    });
  }

  public canTransition(fromState: T, toState: T): boolean {
    if (!this._stateConfig) return true; // No restrictions if not configured

    const stateInfo = this._stateConfig[fromState];
    if (!stateInfo) return true; // Allow if state not in config

    return stateInfo.allowedTransitions.includes(toState);
  }

  public get currentState(): T | null {
    return this._currentState;
  }

  public get previousState(): T | null {
    return this._previousState;
  }

  public getStateConfig(state: T): StateConfig<T> | undefined {
    if (!this._stateConfig) return undefined;
    return this._stateConfig[state];
  }
}
