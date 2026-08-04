import * as THREE from 'three';

export type SceneEventsMap = {
  update: { deltaTime: number };
  rendererChange: { renderer: THREE.WebGLRenderer | null };
};

export type SceneCamera = THREE.Camera & {
  update: (deltaTime: number) => void;
};
