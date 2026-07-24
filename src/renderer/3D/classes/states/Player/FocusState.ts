import { Input, InputState } from '@tgdf';

import { mapInputToControls } from '3D/utils/mapInputToControls';
import { PlayerActionType, FocusOptions, SequenceInputType } from '3D/types';

import { Player } from '../../gameObjects/players/Player';
import { IdleState, State, StateWithHealthEvents } from '../';
import { InputSequenceTracker } from './InputSequenceTracker/InputSequenceTracker';

export class FocusState extends StateWithHealthEvents {
  private _focusInProgress: boolean = false;
  private _exitingFocus: boolean = false;
  private _exitFocusAnimationEnded: boolean = false;
  private _inputSequenceTracker: InputSequenceTracker;

  constructor(
    public entity: Player,
    public options: FocusOptions
  ) {
    super(entity);

    this._inputSequenceTracker = new InputSequenceTracker(options.skills, options.timeoutMs);
  }

  public override onEnter(): void {
    this.entity.animationController.playAnimation(this.options.clips.enter, {
      clampWhenFinished: true,
      onComplete: () => {
        this._focusInProgress = true;
        this.entity.animationController.playAnimation(this.options.clips.progress, {
          loop: true,
        });
      },
    });
  }

  public override onUpdate(_deltaTime: number): State {
    if (this._exitingFocus) {
      return this._exitFocusAnimationEnded ? new IdleState(this.entity) : this;
    }

    const controlsStates = mapInputToControls(Input.getState());

    const isFocusActionPressed = controlsStates.some(
      (controlState) => controlState.type === PlayerActionType.ACTION_FOCUS
    );

    if (!isFocusActionPressed) {
      if (this._focusInProgress) {
        this._focusInProgress = false;
        this._exitingFocus = true;
        this.entity.animationController.playAnimation(this.options.clips.exit, {
          clampWhenFinished: true,
          onComplete: () => {
            this._exitFocusAnimationEnded = true;
          },
        });
      } else {
        return new IdleState(this.entity);
      }
    }

    return this;
  }

  public override onInput(inputState: InputState): State {
    const controlsState = mapInputToControls(inputState);
    const lastInput = controlsState[0];

    if (isSequenceInputType(lastInput.type)) {
      const sequenceResult = this._inputSequenceTracker.push(lastInput.type, performance.now());

      // Skill sequence complete
      if (sequenceResult !== null) {
        sequenceResult.callback?.(this.entity);
        return sequenceResult.getState(this.entity);
      }
    }

    return this;
  }

  protected override recreateInstance(): FocusState {
    return new FocusState(this.entity, this.options);
  }

  public override onExit(): void {}
}

function isSequenceInputType(type: string): type is SequenceInputType {
  return (
    type === PlayerActionType.ACTION_UP ||
    type === PlayerActionType.ACTION_DOWN ||
    type === PlayerActionType.ACTION_RIGHT ||
    type === PlayerActionType.ACTION_LEFT
  );
}
