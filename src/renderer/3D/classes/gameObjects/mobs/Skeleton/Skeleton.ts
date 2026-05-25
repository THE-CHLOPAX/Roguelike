import { getModelFromStore } from '@tgdf';
import { Crowd } from '@recast-navigation/core';

import { punch } from './attacks';
import { MODELS } from '../../../../constants';
import { Humanoid } from '../../Humanoid/Humanoid';
import { MAIN_ENEMY_CROWD_ID } from '../../../../../constants';
import { TestScene } from '../../../../../scenes/test/TestScene';
import { NavMeshAgent } from '../../../gameObjectComponents/NavMeshAgent';
import { DamageHitboxController } from '../../../gameObjectComponents/DamageHitboxController';
import {
  AIEnemyController,
  AIEnemyControllerOptions,
} from '../../../gameObjectComponents/AIEnemyController';

const SKELETON_AI_OPTIONS: AIEnemyControllerOptions = {
  detectionRadius: 8,
};

export class Skeleton extends Humanoid {
  public damageHitboxController: DamageHitboxController;

  constructor(scene: TestScene) {
    const skeletonModel = getModelFromStore(MODELS.SKELETON.id);

    if (!skeletonModel) {
      throw new Error(`Model not found in cache: ${MODELS.SKELETON.id}`);
    }

    skeletonModel.scale.multiplyScalar(1.2);

    super(scene, {
      model: skeletonModel,
      speed: 2.5,
      sprintSpeed: 4,
      walkSpeed: 1,
      rigidBodyOptions: {
        mass: 0.1,
        friction: 0,
        linearDamping: 0,
        lockRotation: true,
        colliderShape: 'box',
        enableCollisionDetection: true,
      },
    });

    this.name = 'Skeleton';

    this.damageHitboxController = this.addComponent(
      'DamageHitboxController',
      new DamageHitboxController(this, this.modelRenderer)
    );

    const navMeshManager = scene.navMeshManager;
    if (!navMeshManager) {
      throw new Error('NavMeshManager not found in scene');
    }

    // Crowd already there
    const existingCrowd = navMeshManager.getCrowd(MAIN_ENEMY_CROWD_ID);
    if (existingCrowd) {
      this._initialize(existingCrowd);
    } else {
      // Crowd not added yet - wait for it
      navMeshManager.events.on('crowdadded', ({ crowdId, crowd }) => {
        if (crowdId === MAIN_ENEMY_CROWD_ID) {
          this._initialize(crowd);
        }
      });
    }
  }

  public override attack(variant: '1' | '2' | '3' | '4'): boolean {
    if (!super.attack(variant)) return false;

    switch (variant) {
      // Kick
      case '1':
        punch(this);
        break;
      // Punch
      case '2':
        // Implement punch logic here
        break;
      // Special Attack 1
      case '3':
        // Implement special attack 1 logic here
        break;
      // Special Attack 2
      case '4':
        // Implement special attack 2 logic here
        break;
    }
    return true;
  }

  private _initialize = (crowd: Crowd): void => {
    this.addComponent(
      'NavMeshAgent',
      new NavMeshAgent(this, crowd, {
        radius: 0.6,
        height: 2.0,
      })
    );
    this.addComponent('AIEnemyController', new AIEnemyController(this, SKELETON_AI_OPTIONS));
  };
}
