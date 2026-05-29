import * as THREE from 'three';

import { EntityAI } from '../../EntityAI';
import { MODELS } from '../../../../constants';
import { AIIdleState } from '../../../states/index';
import { TestScene } from '../../../scenes/TestScene';
import { AnimationClipNamesShared } from '../../../../types';

export class Skeleton extends EntityAI {
  constructor(scene: TestScene) {
    super(scene, {
      model: {
        id: MODELS.SKELETON.id,
        scale: new THREE.Vector3(1.2, 1.2, 1.2),
      },
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
  }

  protected override onInit(): void {
    this.stateController.currentState = new AIIdleState(this, {
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
