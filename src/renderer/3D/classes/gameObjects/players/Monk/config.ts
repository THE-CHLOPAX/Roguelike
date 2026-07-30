import { PlayerActionType } from '3D/types';
import { MODELS, DEFAULT_RIGID_BODY_OPTIONS } from '3D/constants';

import { kick, summonOrbs } from './actions';
import { Player, PlayerOptions } from '../Player';
import { FocusState } from '../../../states/Player/FocusState';
import { AttackState, RunningState, SprintingState } from '../../../states';

enum MonkAnimationClipNames {
  FOCUS_START = 'praying-start',
  FOCUS_PROGRESS = 'praying',
  FOCUS_END = 'spawn',
}

export const config: PlayerOptions = {
  modelOptions: {
    id: MODELS.MONK.id,
  },
  movementOptions: {
    speed: 2.5,
    sprintSpeed: 4,
    walkSpeed: 1,
  },
  rigidBodyOptions: { ...DEFAULT_RIGID_BODY_OPTIONS },
  animationControllerOptions: {
    playbackRates: {
      spawn: 2.5,
      kick: 1.5,
      hit: 1.8,
      run: 0.9,
      [MonkAnimationClipNames.FOCUS_START]: 1.8,
    },
  },
  healthOptions: {
    initialHealthPoints: 10,
  },
  actions: {
    [PlayerActionType.ACTION_UP]: (entity: Player) => {
      return new AttackState(entity, kick);
    },
    [PlayerActionType.ACTION_FOCUS]: (entity: Player) => {
      return new FocusState(entity, {
        clips: {
          enter: MonkAnimationClipNames.FOCUS_START,
          progress: MonkAnimationClipNames.FOCUS_PROGRESS,
          exit: MonkAnimationClipNames.FOCUS_END,
        },
        skills: [summonOrbs],
        timeoutMs: 500,
      });
    },
    [PlayerActionType.RUN]: (entity: Player) => {
      return new RunningState(entity);
    },
    [PlayerActionType.SPRINT]: (entity: Player) => {
      return new SprintingState(entity);
    },
  },
};
