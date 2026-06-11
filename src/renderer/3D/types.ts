import { Entity } from './classes/gameObjects/Entity';

export enum AnimationClipNamesShared {
  SPAWN = 'spawn',
  IDLE = 'idle',
  WALK = 'walk',
  RUN = 'run',
  SPRINT = 'sprint',
  JUMP = 'jump',
  FALL = 'fall',
  HIT = 'hit',
  STAND_UP = 'stand-up',
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

export type AIAttackAction = {
  action: AttackAction;
  minRange: number;
  maxRange: number;
};

export type AIRoamingOptions = {
  radius: number;
  interval: {
    min: number;
    max: number;
  };
};

export type AIAttackOptions = {
  actions: AIAttackAction[];
};
