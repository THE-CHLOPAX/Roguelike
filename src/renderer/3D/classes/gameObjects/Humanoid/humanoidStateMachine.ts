import { HumanoidStates, StateConfig, StateGroup } from '../../../types';

export type HumanoidStateConfig = Record<HumanoidStates, StateConfig<HumanoidStates>>;

// Movement states can transition to any other state except DEAD
const movementStates = [
  HumanoidStates.IDLE,
  HumanoidStates.WALKING,
  HumanoidStates.RUNNING,
  HumanoidStates.SPRINTING,
];

// Action states can only transition to IDLE, physics states, or other action states
const actionStates = [
  HumanoidStates.ATTACKING_1,
  HumanoidStates.ATTACKING_2,
  HumanoidStates.ATTACKING_3,
  HumanoidStates.ATTACKING_4,
];

// Physics states can transition to any movement state or action state
const physicsStates = [HumanoidStates.JUMPING, HumanoidStates.FALLING];

export const HUMANOID_STATE_MACHINE: HumanoidStateConfig = {
  [HumanoidStates.IDLE]: {
    allowedTransitions: [...movementStates, ...actionStates, ...physicsStates, HumanoidStates.DEAD],
    stateGroup: StateGroup.MOVEMENT,
    interruptible: true,
  },
  [HumanoidStates.WALKING]: {
    allowedTransitions: [...movementStates, ...actionStates, ...physicsStates, HumanoidStates.DEAD],
    stateGroup: StateGroup.MOVEMENT,
    interruptible: true,
  },
  [HumanoidStates.RUNNING]: {
    allowedTransitions: [...movementStates, ...actionStates, ...physicsStates, HumanoidStates.DEAD],
    stateGroup: StateGroup.MOVEMENT,
    interruptible: true,
  },
  [HumanoidStates.SPRINTING]: {
    allowedTransitions: [...movementStates, ...actionStates, ...physicsStates, HumanoidStates.DEAD],
    stateGroup: StateGroup.MOVEMENT,
    interruptible: true,
  },
  [HumanoidStates.JUMPING]: {
    allowedTransitions: [
      ...movementStates,
      ...actionStates,
      HumanoidStates.FALLING,
      HumanoidStates.DEAD,
    ],
    stateGroup: StateGroup.PHYSICS,
    interruptible: true,
  },
  [HumanoidStates.FALLING]: {
    allowedTransitions: [
      ...movementStates,
      ...actionStates,
      HumanoidStates.JUMPING,
      HumanoidStates.DEAD,
    ],
    stateGroup: StateGroup.PHYSICS,
    interruptible: true,
  },
  [HumanoidStates.ATTACKING_1]: {
    allowedTransitions: [HumanoidStates.IDLE, ...physicsStates, HumanoidStates.DEAD],
    stateGroup: StateGroup.ACTION,
    interruptible: false,
  },
  [HumanoidStates.ATTACKING_2]: {
    allowedTransitions: [HumanoidStates.IDLE, ...physicsStates, HumanoidStates.DEAD],
    stateGroup: StateGroup.ACTION,
    interruptible: false,
  },
  [HumanoidStates.ATTACKING_3]: {
    allowedTransitions: [HumanoidStates.IDLE, ...physicsStates, HumanoidStates.DEAD],
    stateGroup: StateGroup.ACTION,
    interruptible: false,
  },
  [HumanoidStates.ATTACKING_4]: {
    allowedTransitions: [HumanoidStates.IDLE, ...physicsStates, HumanoidStates.DEAD],
    stateGroup: StateGroup.ACTION,
    interruptible: false,
  },
  [HumanoidStates.DEAD]: {
    allowedTransitions: [], // Terminal state
    stateGroup: StateGroup.DEAD,
    interruptible: false,
  },
};
