import * as THREE from 'three';

export const GAME_OBJECT_MESSAGES = {
  ADD_COMPONENT_DUPLICATE: (name: string) =>
    `[GameObject] Component "${name}" already added to GameObject.`,
  REMOVE_COMPONENT_NOT_FOUND: (name: string) =>
    `[GameObject] Component "${name}" not found in GameObject.`,
  ADDING_OBJECT_TO_GAME_OBJECT: (object: THREE.Object3D) =>
    `[GameObject] Adding object to GameObject: ${object.name || object.type}`,
  REMOVING_OBJECT_FROM_GAME_OBJECT: (object: THREE.Object3D) =>
    `[GameObject] Removing object from GameObject: ${object.name || object.type}`,
} as const;
