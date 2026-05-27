import { getModelFromStore } from '@tgdf';
import { Crowd } from '@recast-navigation/core';

import { MODELS } from '../../../../constants';
import { EntityMovable } from '../../EntityMovable';
import { AIIdleState } from '../../../states/index';
import { AnimationClipNamesShared } from '../../../../types';
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
      walkSpeed: 0.5,
      rigidBodyOptions: {
        mass: 0.1,
        friction: 0,
        linearDamping: 0,
        lockRotation: true,
        colliderShape: 'cylinder',
        enableCollisionDetection: true,
      },
      animationControllerOptions: {
        playbackRates: {
          [AnimationClipNamesShared.WALK]: 1.5,
        },
        fadeOutDurations: {
          [AnimationClipNamesShared.IDLE]: 0.1,
        },
      },
    });

    this.name = 'Skeleton';

    const navMeshManager = scene.navMeshManager;
    if (!navMeshManager) {
      throw new Error('NavMeshManager not found in scene');
    }

    const existingCrowd = navMeshManager.getCrowd(MAIN_ENEMY_CROWD_ID);
    // Crowd already there
    if (existingCrowd) {
      this._initialize(existingCrowd);
    } else {
      // Crowd not added yet - wait for it
      navMeshManager.events.on('crowdadded', this._onCrowdAdded);
    }
  }

  protected override onDestroyed(): void {
    const navMeshManager = this.scene?.navMeshManager;
    if (navMeshManager) {
      navMeshManager.events.off('crowdadded', this._onCrowdAdded);
    }
    super.onDestroyed();
  }

  private _onCrowdAdded = ({ crowdId, crowd }: { crowdId: string; crowd: Crowd }) => {
    if (crowdId === MAIN_ENEMY_CROWD_ID) {
      this._initialize(crowd);
    }
  };

  private _initialize(crowd: Crowd): void {
    const navMeshAgent = this.addComponent(
      'NavMeshAgent',
      new NavMeshAgent(this, crowd, {
        radius: 0.6,
        height: 2.0,
      })
    );

    const sceneNavMesh = this.scene?.navMeshManager?.navMesh;
    if (!sceneNavMesh) {
      throw new Error('NavMesh not found in scene NavMeshManager');
    }

    this.stateController.currentState = new AIIdleState(this, {
      navMeshAgent,
      navMesh: sceneNavMesh,
      roaming: {
        radius: 5,
        interval: {
          min: 3000,
          max: 7000,
        },
      },
    });
  }
}
