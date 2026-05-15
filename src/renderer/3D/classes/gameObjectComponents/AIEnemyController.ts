import { GameObjectComponent } from '@tgdf';

import { Player } from '../gameObjects/players/Player';
import { Humanoid } from '../gameObjects/Humanoid/Humanoid';

export type AIEnemyControllerOptions = {
  detectionRadius: number;
};

const ATTACK_DISTANCE = 1;

export class AIEnemyController extends GameObjectComponent {
  private _detectionRadius: number;

  private _currentTarget: Player | null = null;
  private _currentDetectionList: Set<Player> = new Set();

  constructor(gameObject: Humanoid, options: AIEnemyControllerOptions) {
    super(gameObject);

    this._detectionRadius = options.detectionRadius;
  }

  protected override onUpdate(_deltaTime: number): void {
    this.scene?.children.forEach((object) => {
      if (object === this.gameObject) return;

      if (object instanceof Player) {
        const distance = this.gameObject.position.distanceTo(object.position);
        const isInDetectionRange = distance <= this._detectionRadius;
        if (isInDetectionRange) {
          this._currentDetectionList.add(object);
        } else {
          this._currentDetectionList.delete(object);
        }
      }
    });

    if (this._currentDetectionList.size === 0) {
      this._currentTarget = null;
      return;
    }

    const sortedDetectionList = this._sortDetectionListByDistance();
    // Set the closest player as the current target
    this._currentTarget = sortedDetectionList[0];

    // Move towards the current target
    if (this._currentTarget && this.gameObject instanceof Humanoid) {
      const distanceToTarget = this.gameObject.position.distanceTo(this._currentTarget.position);
      // If we're outside of attack range, move towards the target
      if (distanceToTarget > ATTACK_DISTANCE) {
        this.gameObject.moveTo(this._currentTarget.position);
      } else {
        // If we're within attack range, attack if not already attacking
        const currentState = this.gameObject.stateController.currentState;
        const isAttacking =
          currentState &&
          (currentState.startsWith('attack-') || currentState.includes('ATTACKING'));

        if (!isAttacking) {
          this.gameObject.attack('1');
        }
      }
    }
  }

  private _sortDetectionListByDistance(): Player[] {
    return Array.from(this._currentDetectionList).sort((a, b) => {
      const distanceA = this.gameObject.position.distanceTo(a.position);
      const distanceB = this.gameObject.position.distanceTo(b.position);
      return distanceA - distanceB;
    });
  }
}
