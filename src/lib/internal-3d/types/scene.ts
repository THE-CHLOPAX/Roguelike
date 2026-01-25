import * as THREE from 'three';
import { AssetState, KeyboardInput, MouseInput } from '@tgdf';

import { Scene } from '../Scene/Scene';

export type SceneConstructorOptions = {
  physics?: {
    gravity: THREE.Vector3;
  };
  keyboardHandlers?: KeyboardInput;
  mouseHandlers?: MouseInput;
};

export type SceneEventsMap = {
  update: { deltaTime: number };
};
