import { Entity } from './classes/gameObjects/Entity';

export enum AnimationClipNamesShared {
  IDLE = 'idle',
  WALK = 'walk',
  RUN = 'run',
  SPRINT = 'sprint',
  JUMP = 'jump',
  FALL = 'fall',
  DIE = 'die',
}

export enum StateGroup {
  MOVEMENT = 'movement',
  ACTION = 'action',
  PHYSICS = 'physics',
  DEAD = 'dead',
}

export type ModelRecord = {
  id: string;
  path: string;
  nameExtractor?: string;
};

export type StateConfig<T> = {
  allowedTransitions: T[];
  stateGroup: StateGroup;
  interruptible: boolean;
};

export type AttackAction = (entity: Entity) => Promise<void>;
