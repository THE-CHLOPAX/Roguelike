import { gsap } from 'gsap';
import * as THREE from 'three';

import { Entity } from '../../Entity';
import { AttackAction } from '../../../../types';

export const punch: AttackAction = (entity: Entity) =>
  new Promise<void>((resolve) => {
    const HITBOX_DELAY = 0.7; // Delay in milliseconds before the hitbox is attached
    const HITBOX_DURATION = 0.8; // Duration in milliseconds for which the hitbox remains active

    gsap
      .timeline()
      .call(
        () =>
          entity.damageHitboxController.attachDamageHitbox(
            new THREE.Vector3(0.3, 0.3, 0.3),
            10,
            'Ctrl_Hand_IK_Right'
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

    entity.animationController.playAnimation('attack-1', {
      clampWhenFinished: true,
      playbackRate: 1.3,
      onComplete: () => {
        entity.damageHitboxController.removeDamageHitbox();
        resolve();
      },
    });
  });
