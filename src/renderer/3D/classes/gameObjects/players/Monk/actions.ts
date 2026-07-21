import { gsap } from 'gsap';
import * as THREE from 'three';

import { Entity } from '../../Entity';
import { FMOD_EVENTS } from '../../../../../FMOD';
import { ActionWithSound } from '../../../../types';

export const kick: ActionWithSound = {
  action: (entity: Entity) =>
    new Promise<void>((resolve) => {
      const HITBOX_DELAY = 0.3; // Delay in seconds before the hitbox is attached
      const HITBOX_DURATION = 0.4; // Duration in seconds for which the hitbox remains active

      entity.damageHitboxController.hitboxTimeline = gsap
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
            entity.damageHitboxController.clearHitboxEvents();
          },
          [],
          HITBOX_DELAY + HITBOX_DURATION
        );

      entity.animationController.playAnimation('kick', {
        clampWhenFinished: true,
        playbackRate: 1.3,
        onComplete: () => {
          resolve();
          entity.damageHitboxController.clearHitboxEvents();
        },
      });
    }),
  soundPath: FMOD_EVENTS.ATTACK,
};

export const enterFocusMode: ActionWithSound = {
  action: (entity: Entity) =>
    new Promise<void>((resolve) => {
      entity.animationController.playAnimation('praying-start', {
        clampWhenFinished: true,
        playbackRate: 1.3,
        onComplete: () => {
          resolve();
        },
      });
    }),
  soundPath: '',
};
