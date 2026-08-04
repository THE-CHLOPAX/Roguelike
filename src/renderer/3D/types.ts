import * as THREE from 'three';
import { SceneCamera } from '@tgdf';

import { State } from './classes/states';
import { Entity } from './classes/gameObjects/Entity';
import { Player } from './classes/gameObjects/players/Player';

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

export enum PlayerActionType {
  IDLE = 'idle',
  RUN = 'run',
  SPRINT = 'sprint',
  ACTION_UP = 'action-up',
  ACTION_DOWN = 'action-down',
  ACTION_LEFT = 'action-left',
  ACTION_RIGHT = 'action-right',
  ACTION_FOCUS = 'action-focus',
}

export type ModelRecord = {
  id: string;
  path: string;
  nameExtractor?: string;
};

export type AsyncAction = (entity: Entity) => Promise<void>;

export type ActionWithSound = {
  action: AsyncAction;
  soundPath: string;
};

export type AIAttack = ActionWithSound & {
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
  actions: AIAttack[];
};

export type SequenceInputType =
  | PlayerActionType.ACTION_UP
  | PlayerActionType.ACTION_RIGHT
  | PlayerActionType.ACTION_DOWN
  | PlayerActionType.ACTION_LEFT;

export type SequenceSkill = {
  sequence: SequenceInputType[];
  getState?: (entity: Player) => State;
  callback?: AsyncAction;
};

export type FocusOptions = {
  clips: { enter: string; progress?: string; exit?: string };
  skills: SequenceSkill[];
  timeoutMs: number;
};

export type GameCamera = SceneCamera & {
  addShake: (intensity: number) => void;
  pivotPoint: THREE.Vector3;
};
