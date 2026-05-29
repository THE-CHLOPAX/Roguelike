import * as THREE from 'three';

export type SceneEventsMap = {
  update: { deltaTime: number };
  rendererChange: { renderer: THREE.WebGLRenderer | null };
};
