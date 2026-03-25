export enum HumanoidStates {
  IDLE = 'idle',
  WALKING = 'walk',
  RUNNING = 'run',
  SPRINTING = 'sprint',
  JUMPING = 'jump',
  ATTACKING_1 = 'attack-1',
  ATTACKING_2 = 'attack-2',
  ATTACKING_3 = 'attack-3',
  ATTACKING_4 = 'attack-4',
  FALLING = 'fall',
  DEAD = 'dead',
}

export enum StateGroup {
  MOVEMENT = 'movement',
  ACTION = 'action',
  PHYSICS = 'physics',
  DEAD = 'dead',
}

export type StateConfig<T> = {
  allowedTransitions: T[];
  stateGroup: StateGroup;
  interruptible: boolean;
};
