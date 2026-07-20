import { kick } from './attacks';
import { Player, PlayerOptions } from '../Player';
import { PlayerActionType } from '../../../../../3D/types';
import { AttackState, RunningState, SprintingState } from '../../../states';
import { MODELS, DEFAULT_RIGID_BODY_OPTIONS } from '../../../../../3D/constants';

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
      spawn: 2,
      kick: 1.5,
      hit: 1.8,
      run: 0.9,
    },
  },
  healthOptions: {
    initialHealthPoints: 10,
  },
  actions: {
    [PlayerActionType.ACTION_UP]: (entity: Player) => {
      return new AttackState(entity, kick);
    },
    [PlayerActionType.ACTION_DOWN]: (entity: Player) => {
      return new AttackState(entity, kick);
    },
    [PlayerActionType.ACTION_LEFT]: (entity: Player) => {
      return new AttackState(entity, kick);
    },
    [PlayerActionType.ACTION_RIGHT]: (entity: Player) => {
      return new AttackState(entity, kick);
    },
    [PlayerActionType.ACTION_FOCUS]: (entity: Player) => {
      return new AttackState(entity, kick);
    },
    [PlayerActionType.RUN]: (entity: Player) => {
      return new RunningState(entity);
    },
    [PlayerActionType.SPRINT]: (entity: Player) => {
      return new SprintingState(entity);
    },
  },
};
