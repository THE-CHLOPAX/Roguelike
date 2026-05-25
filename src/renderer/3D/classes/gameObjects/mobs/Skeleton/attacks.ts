import { gsap } from 'gsap';
import * as THREE from 'three';

import { Skeleton } from './Skeleton';
import { HumanoidStates } from '../../../../../3D/types';
import { onBeforeAttack } from '../../../../../3D/utils/onBeforeAttack';

export const punch = (instance: Skeleton) => {
  onBeforeAttack(instance);

  const HITBOX_DELAY = 0.7; // Delay in milliseconds before the hitbox is attached
  const HITBOX_DURATION = 0.8; // Duration in milliseconds for which the hitbox remains active

  instance.attackTimeline = gsap
    .timeline()
    .call(
      () =>
        instance.damageHitboxController.attachDamageHitbox(
          new THREE.Vector3(0.3, 0.3, 0.3),
          10,
          'Ctrl_Hand_IK_Right'
        ),
      [],
      HITBOX_DELAY
    )
    .call(
      () => {
        instance.damageHitboxController.removeDamageHitbox();
      },
      [],
      HITBOX_DELAY + HITBOX_DURATION
    );

  instance.animationController.playAnimation(HumanoidStates.ATTACKING_1, {
    clampWhenFinished: true,
    playbackRate: 1.3,
    onComplete: () => {
      instance.damageHitboxController.removeDamageHitbox();
      instance.attackTimeline = null;
      instance.stateController.setState(HumanoidStates.IDLE);
    },
  });
};
