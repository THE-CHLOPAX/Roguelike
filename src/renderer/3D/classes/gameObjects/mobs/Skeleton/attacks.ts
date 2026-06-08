import { gsap } from 'gsap';
import * as THREE from 'three';

import { Entity } from '../../Entity';
import { AIAttackAction } from '../../../../types';

export enum SkeletonAttackAnimations {
  PUNCH = 'punch',
}

export const attackActions: AIAttackAction[] = [
  {
    action: punch,
    minRange: 0,
    maxRange: 1,
  },
];

function punch(entity: Entity) {
  return new Promise<void>((resolve) => {
    const HITBOX_DELAY = 0.7; // Delay in seconds before the hitbox is attached
    const HITBOX_DURATION = 0.8; // Duration in seconds for which the hitbox remains active

    const timeline = gsap
      .timeline()
      .call(
        () =>
          entity.damageHitboxController.attachDamageHitbox(
            new THREE.Vector3(0.3, 0.3, 0.3),
            10,
            'mixamorigRightHand'
          ),
        [],
        HITBOX_DELAY
      )
      .call(
        () => {
          entity.damageHitboxController.removeDamageHitbox();
        },
        [],
        HITBOX_DELAY + HITBOX_DURATION
      );

    entity.animationController.playAnimation(SkeletonAttackAnimations.PUNCH, {
      clampWhenFinished: true,
      playbackRate: 1.8,
      onComplete: () => {
        entity.damageHitboxController.removeDamageHitbox();
        timeline.kill();
        resolve();
      },
    });
  });
}
