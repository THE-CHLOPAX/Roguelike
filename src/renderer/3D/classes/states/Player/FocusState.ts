import { Input, InputState } from '@tgdf';

import { PlayerActionType } from '3D/types';
import { mapInputToControls } from '3D/utils/mapInputToControls';

import { Player } from '../../gameObjects/players/Player';
import { IdleState, State, StateWithHealthEvents } from '../';

export class FocusState extends StateWithHealthEvents {
  private _focusInProgress: boolean = false;
  private _exitingFocus: boolean = false;
  private _exitFocusAnimationEnded: boolean = false;

  constructor(
    public entity: Player,
    public enterFocusClipName: string,
    public focusProgressClipName: string,
    public exitFocusClipName: string
  ) {
    super(entity);
  }

  public override onEnter(): void {
    this.entity.animationController.playAnimation(this.enterFocusClipName, {
      clampWhenFinished: true,
      onComplete: () => {
        this._focusInProgress = true;
        this.entity.animationController.playAnimation(this.focusProgressClipName, {
          loop: true,
        });
      },
    });
  }

  public override onUpdate(_deltaTime: number): State {
    if (this._exitingFocus) {
      return this._exitFocusAnimationEnded ? new IdleState(this.entity) : this;
    }

    const controlState = mapInputToControls(Input.getState());

    const isFocusActionPressed = controlState.type === PlayerActionType.ACTION_FOCUS;

    if (!isFocusActionPressed) {
      if (this._focusInProgress) {
        this._focusInProgress = false;
        this._exitingFocus = true;
        this.entity.animationController.playAnimation(this.exitFocusClipName, {
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

  public override onInput(_inputState: InputState): State {
    return this;
  }

  protected override recreateInstance(): FocusState {
    return new FocusState(
      this.entity,
      this.enterFocusClipName,
      this.focusProgressClipName,
      this.exitFocusClipName
    );
  }

  public override onExit(): void {}
}
