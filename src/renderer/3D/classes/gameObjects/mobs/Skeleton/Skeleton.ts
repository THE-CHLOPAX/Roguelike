import * as THREE from 'three';

import { EntityAI } from '../../EntityAI';
import { Player } from '../../players/Player';
import { AIIdleState } from '../../../states/index';
import { TestScene } from '../../../scenes/TestScene';
import { AnimationClipNamesShared } from '../../../../types';
import { DEFAULT_RIGID_BODY_OPTIONS, MODELS } from '../../../../constants';

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
        ...DEFAULT_RIGID_BODY_OPTIONS,
      },
      animationControllerOptions: {
        playbackRates: {
          [AnimationClipNamesShared.WALK]: 1.5,
          [AnimationClipNamesShared.RUN]: 1.5,
        },
        fadeOutDurations: {
          [AnimationClipNamesShared.IDLE]: 0.1,
        },
      },
      detectionRadius: 5,
      enemyTypes: [Player],
      roaming: {
        radius: 5,
        interval: {
          min: 3000,
          max: 7000,
        },
      },
    });

    this.name = 'Skeleton';
  }

  protected override onInit(): void {
    this.stateController.currentState = new AIIdleState(this);
  }
}
