import { Input, InputState } from '@tgdf';

import { mapInputToControls } from '3D/utils/mapInputToControls';
import { PlayerActionType, FocusOptions, SequenceInputType } from '3D/types';

import { IdleState, State, HurtState } from '../';
import { Player } from '../../gameObjects/players/Player';
import { InputSequenceTracker } from './InputSequenceTracker/InputSequenceTracker';

export class FocusState extends State {
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

        const progressClip = this.options.clips.progress;
        if (progressClip) {
          // If no progress clip is provided, the enter animation stays clamped on its last frame.
          this.entity.animationController.playAnimation(progressClip, { loop: true });
        }
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

        const exitClip = this.options.clips.exit;
        if (exitClip) {
          this._exitingFocus = true;
          this.entity.animationController.playAnimation(exitClip, {
            clampWhenFinished: true,
            onComplete: () => {
              this._exitFocusAnimationEnded = true;
            },
          });
        } else {
          return new IdleState(this.entity);
        }
      } else {
        return new IdleState(this.entity);
      }
    }

    return this;
  }

  public override onInput(inputState: InputState): State {
    if (!this._focusInProgress) return this;

    const controlsState = mapInputToControls(inputState);
    const lastInput = controlsState[0];

    if (isSequenceInputType(lastInput.type)) {
      const sequenceResult = this._inputSequenceTracker.push(lastInput.type, performance.now());

      // Skill sequence complete
      if (sequenceResult !== null) {
        sequenceResult.callback?.(this.entity);
        return sequenceResult.getState?.(this.entity) ?? this;
      }
    }

    return this;
  }

  protected override onDamageTaken(): State {
    return new HurtState(this.entity, new FocusState(this.entity, this.options));
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
