import * as THREE from 'three';
import { KeyboardInput, MouseInput } from '@tgdf';

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
