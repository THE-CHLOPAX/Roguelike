import { gsap } from 'gsap';
import * as THREE from 'three';

import { IdleState, RunningState, SprintingState } from 'renderer/3D/classes/states';

import { Entity } from '../../Entity';
import { FMOD_EVENTS } from '../../../../../FMOD';
import { SacredOrb } from './childObjects/SacredOrb';
import { ArcaneCircle } from './childObjects/ArcaneCircle';
import { FocusState } from '../../../states/Player/FocusState';
import { ActionWithSound, SequenceSkill, PlayerActionType } from '../../../../types';

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

const SACRED_ORB_COUNT = 3;
const SACRED_ORB_FORMATION_RADIUS = 1;
const SACRED_ORB_ANGLE_STEP = (Math.PI * 2) / SACRED_ORB_COUNT;
const SACRED_ORB_ROTATION_DURATION = 6;

export const summonOrbs: SequenceSkill = {
  sequence: [
    PlayerActionType.ACTION_UP,
    PlayerActionType.ACTION_RIGHT,
    PlayerActionType.ACTION_DOWN,
    PlayerActionType.ACTION_LEFT,
  ],
  availableIn: [FocusState],
  callback: (entity) => {
    return new Promise((resolve) => {
      const sacredOrbGroup = new THREE.Group();

      for (let i = 0; i < SACRED_ORB_COUNT; i++) {
        const sacredOrb = new SacredOrb(entity);
        const angle = i * SACRED_ORB_ANGLE_STEP;

        sacredOrb.position.set(
          Math.cos(angle) * SACRED_ORB_FORMATION_RADIUS,
          0,
          Math.sin(angle) * SACRED_ORB_FORMATION_RADIUS
        );

        sacredOrbGroup.add(sacredOrb);
      }

      sacredOrbGroup.position.set(0, 0, 0);

      entity.add(sacredOrbGroup);

      gsap.to(sacredOrbGroup.rotation, {
        y: `+=${Math.PI * 2}`,
        duration: SACRED_ORB_ROTATION_DURATION,
        repeat: -1,
        ease: 'none',
      });

      resolve();
    });
  },
};

export const healingAura: SequenceSkill = {
  sequence: [
    PlayerActionType.ACTION_UP,
    PlayerActionType.ACTION_UP,
    PlayerActionType.ACTION_LEFT,
    PlayerActionType.ACTION_RIGHT,
  ],
  availableIn: [FocusState],
  callback: (entity) => {
    return new Promise((resolve) => {
      const arcaneCircle = new ArcaneCircle(entity.scene, {
        diameter: 4,
        healAmount: 10,
        durationMs: 5000,
        healIntervalMs: 1000,
      });
      entity.add(arcaneCircle);
      resolve();
    });
  },
};

export const roll: SequenceSkill = {
  sequence: [PlayerActionType.ACTION_UP, PlayerActionType.ACTION_UP],
  availableIn: [RunningState, SprintingState],
  getState: (entity) => new IdleState(entity),
  callback: (_entity) => {
    return new Promise((resolve) => {
      resolve();
    });
  },
};
