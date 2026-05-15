import * as THREE from 'three';

export type SceneConstructorOptions = {
  physics?: {
    gravity: THREE.Vector3;
  };
};

export type SceneEventsMap = {
  update: { deltaTime: number };
  rendererChange: { renderer: THREE.WebGLRenderer | null };
};
