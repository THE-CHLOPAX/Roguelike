import { Entity } from './classes/gameObjects/Entity';

export enum Animations {
  IDLE = 'idle',
  WALKING = 'walk',
  RUNNING = 'run',
  SPRINTING = 'sprint',
  JUMPING = 'jump',
  ATTACKING = 'attack',
  FALLING = 'fall',
  DEAD = 'dead',
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
