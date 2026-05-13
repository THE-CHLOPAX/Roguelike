import { gsap } from 'gsap';
import * as THREE from 'three';
import { logger } from '@tgdf';

import { Monk } from './Monk';
import { HumanoidStates } from '../../../../types';

export const kick = (instance: Monk): void => {
  if (instance.isMoving) return;

  // Kill any existing attack timeline
  if (instance.attackTimeline) {
    instance.attackTimeline.kill();
    instance.attackTimeline = null;
  }

  if (!instance.scene) {
    logger({
      type: 'error',
      message: 'Scene is not available for Monk attack',
    });
    return;
  }

  const HITBOX_DELAY = 0.3; // Delay in milliseconds before the hitbox is attached
  const HITBOX_DURATION = 0.4; // Duration in milliseconds for which the hitbox remains active

  instance.attackTimeline = gsap
    .timeline()
    .call(
      () => instance.addHitbox(new THREE.Vector3(0.3, 1, 0.3), 10, 'Ctrl_Foot_IK_Right'),
      [],
      HITBOX_DELAY
    )
    .call(
      () => {
        instance.removeHitbox();
      },
      [],
      HITBOX_DELAY + HITBOX_DURATION
    );

  instance.animationController.playAnimation(HumanoidStates.ATTACKING_1, {
    clampWhenFinished: true,
    playbackRate: 1.3,
    onComplete: () => {
      instance.removeHitbox();
      instance.attackTimeline = null;
      instance.stateController.setState(HumanoidStates.IDLE);
    },
  });
};
