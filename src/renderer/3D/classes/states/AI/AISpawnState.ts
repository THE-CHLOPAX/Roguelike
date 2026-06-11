import { AIState } from './AIState';
import { EntityAI } from '../../gameObjects/EntityAI';
import { AnimationClipNamesShared } from '../../../types';
import { AIStateNoHealthEvents } from './AIStateNoHealthEvents';

export class AISpawnState extends AIStateNoHealthEvents {
  private _spawnAnimationEnded: boolean = false;

  constructor(
    public entity: EntityAI,
    public nextState: AIState
  ) {
    super(entity);
  }

  public override onExit(): void {}

  public override onEnter(): void {
    this.entity.animationController.playAnimation(AnimationClipNamesShared.SPAWN, {
      clampWhenFinished: true,
      onComplete: () => {
        this._spawnAnimationEnded = true;
      },
    });
  }

  public override onUpdate(_deltaTime: number): AIState {
    if (this._spawnAnimationEnded) {
      return this.nextState;
    }

    return this;
  }
}
