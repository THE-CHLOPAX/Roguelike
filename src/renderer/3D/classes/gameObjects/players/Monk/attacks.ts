import { gsap } from 'gsap';
import * as THREE from 'three';

import { Entity } from '../../Entity';
import { AttackAction } from '../../../../types';

export const kick: AttackAction = (entity: Entity) =>
  new Promise<void>((resolve) => {
    const HITBOX_DELAY = 0.3; // Delay in milliseconds before the hitbox is attached
    const HITBOX_DURATION = 0.4; // Duration in milliseconds for which the hitbox remains active

    const timeline = gsap
      .timeline()
      .call(
        () =>
          entity.damageHitboxController.attachDamageHitbox(
            new THREE.Vector3(0.3, 1, 0.3),
            10,
            'mixamorigRightFoot'
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

    entity.animationController.playAnimation('kick', {
      clampWhenFinished: true,
      playbackRate: 1.3,
      onComplete: () => {
        resolve();
        entity.damageHitboxController.removeDamageHitbox();
        timeline.kill();
      },
    });
  });
