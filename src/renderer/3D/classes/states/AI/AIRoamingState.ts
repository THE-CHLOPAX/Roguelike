import { InputState, logger } from '@tgdf';

import { AIIdleState } from './AIIdleState';
import { AIState, AIStateOptions } from './AIState';
import { AnimationClipNamesShared } from '../../../types';
import { EntityMovable } from '../../gameObjects/EntityMovable';
import { getRandomNavMeshPointInRadius } from '../../../utils/getRandomNavMeshPointInRadius';

export type RoamingOptions = {
  radius: number;
  interval: {
    min: number;
    max: number;
  };
};

export class AIRoamingState extends AIState {
  private _shouldTransitionToIdle: boolean = false;

  constructor(
    public entity: EntityMovable,
    protected options: AIStateOptions & RoamingOptions
  ) {
    super(entity, options);
  }

  public override onEnter(): void {
    this.entity.animationController.playAnimation(AnimationClipNamesShared.WALK, {
      loop: true,
    });
    this._roamToRandomPoint().finally(() => {
      this._shouldTransitionToIdle = true; // After roaming to a random point, transition back to idle
    });
  }
  public override onExit(): void {}

  public override onInput(_inputState: InputState): AIState {
    return this;
  }
  public override onUpdate(_deltaTime: number): AIState {
    if (this._shouldTransitionToIdle) {
      this._shouldTransitionToIdle = false;
      return new AIIdleState(this.entity, this.options);
    }
    return this;
  }

  private _roamToRandomPoint(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.options) {
        reject(new Error('Roaming options are not defined'));
        return;
      }

      const navMeshAgent = this.options.navMeshAgent;
      const navMesh = this.options.navMesh;

      const randomNavMeshPoint = getRandomNavMeshPointInRadius(
        navMesh,
        this.entity.spawnPosition,
        this.options?.radius
      );

      if (!randomNavMeshPoint) {
        reject(new Error('Failed to find a random point on the NavMesh'));
        return;
      }

      logger({
        message: `AI roaming to random point: ${randomNavMeshPoint
          .toArray()
          .map((n) => n.toFixed(2))
          .join(', ')}`,
        type: 'info',
      });

      navMeshAgent
        .moveTo(randomNavMeshPoint, this.entity.walkSpeed)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
