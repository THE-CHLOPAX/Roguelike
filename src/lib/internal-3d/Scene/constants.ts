import * as THREE from 'three';

export const SCENE_MESSAGES = {
  ADDING_OBJECT: (object: THREE.Object3D) =>
    `Scene: Adding object to scene: ${object.name || object.type}`,
  REMOVING_OBJECT: (object: THREE.Object3D) =>
    `Scene: Removing object from scene: ${object.name || object.type}`,
  PHYSICS_WORLD_INITIALIZED: 'Scene: Physics world initialized',
} as const;
