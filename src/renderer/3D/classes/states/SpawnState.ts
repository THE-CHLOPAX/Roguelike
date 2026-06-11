import { InputState } from '@tgdf';

import { State } from './State';
import { Entity } from '../gameObjects/Entity';
import { AnimationClipNamesShared } from '../../types';
import { StateNoHealthEvents } from './StateNoHealthEvents';

export class SpawnState extends StateNoHealthEvents {
  private _spawnAnimationEnded: boolean = false;

  constructor(
    public entity: Entity,
    public nextState: State
  ) {
    super(entity);
  }

  public onEnter(): void {
    this.entity.animationController.playAnimation(AnimationClipNamesShared.SPAWN, {
      clampWhenFinished: true,
      onComplete: () => {
        this._spawnAnimationEnded = true;
      },
    });
  }

  public onExit(): void {}

  public onInput(_inputState: InputState): State {
    return this;
  }

  public onUpdate(_deltaTime: number): State {
    if (this._spawnAnimationEnded) {
      return this.nextState;
    }

    return this;
  }
}
