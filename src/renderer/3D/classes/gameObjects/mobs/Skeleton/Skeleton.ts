import { getModelFromStore } from '@tgdf';
import { Crowd } from '@recast-navigation/core';

import { punch } from './attacks';
import { MODELS } from '../../../../constants';
import { EntityMovable } from '../../EntityMovable';
import { AIIdleState } from '../../../states/index';
import { MAIN_ENEMY_CROWD_ID } from '../../../../../constants';
import { TestScene } from '../../../../../scenes/test/TestScene';
import { NavMeshAgent } from '../../../gameObjectComponents/NavMeshAgent';

export class Skeleton extends EntityMovable {
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
      attackAction: punch,
    });

    this.name = 'Skeleton';

    this.stateController.currentState = new AIIdleState(this);

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

  private _initialize = (crowd: Crowd): void => {
    this.addComponent(
      'NavMeshAgent',
      new NavMeshAgent(this, crowd, {
        radius: 0.6,
        height: 2.0,
      })
    );
  };
}
