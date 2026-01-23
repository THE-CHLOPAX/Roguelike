import * as THREE from 'three';

import { Scene } from '../Scene/Scene';
import { SceneEventsMap } from './scene';

export type GameObjectComponentTemplate = {
  name: string;
  options?: unknown;
}

export type GameObjectConstructorOptions<K extends SceneEventsMap = SceneEventsMap> = { scene: Scene<K>; object: THREE.Object3D }

export type GameObjectEventMap = {
  'awake': void;
  'destroyed': void;
  'update': { deltaTime: number };
}