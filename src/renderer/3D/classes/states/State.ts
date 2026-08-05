import { InputState } from '@tgdf';

import { Entity } from '../gameObjects/Entity';

export abstract class State {
  constructor(public entity: Entity) {}

  public update(deltaTime: number): State {
    return this.onUpdate(deltaTime);
  }

  public input(inputState: InputState): State {
    return this.onInput(inputState);
  }

  public enter(): void {
    this.entity.healthPointsController.isImmuneToDamage = this.isDamageImmune;
    this.entity.healthPointsController.events.on('damagetaken', this._handleDamageTaken);
    this.onEnter();
  }

  public exit(): void {
    this.entity.healthPointsController.events.off('damagetaken', this._handleDamageTaken);
    this.onExit();
  }

  /** Whether the entity ignores incoming damage entirely while in this state. */
  protected get isDamageImmune(): boolean {
    return false;
  }

  public abstract onEnter(): void;

  public abstract onExit(): void;

  public abstract onInput(inputState: InputState): State;

  public abstract onUpdate(deltaTime: number): State;

  /**
   * Reaction to taking damage while in this state. Return the state to
   * transition into, or null to stay in the current state. The transition is
   * queued on the StateController rather than applied mid-frame.
   */
  protected abstract onDamageTaken(): State | null;

  private _handleDamageTaken = () => {
    const reaction = this.onDamageTaken();
    if (reaction !== null) {
      this.entity.stateController.requestTransition(reaction);
    }
  };
}
