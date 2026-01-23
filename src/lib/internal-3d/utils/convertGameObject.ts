import * as THREE from 'three';
import * as InternalComponents from '@tgdf/internal-game-components/index';
import { Scene, logger, GameObject, GameObjectComponentTemplate, GameObjectEventMap } from '@tgdf';

import { SceneEventsMap } from '../types/scene';

const GAME_OBJECT_COMPONENTS_PROPERTY = 'gameObjectComponents';

export function convertGameObject<T extends SceneEventsMap = SceneEventsMap>(object: THREE.Object3D, scene: Scene<T>): GameObject<GameObjectEventMap, T> | null {
  const gameObjectComponentsData = object.userData[GAME_OBJECT_COMPONENTS_PROPERTY] as GameObjectComponentTemplate[] | undefined;
  if (gameObjectComponentsData) {
    const gameObject = new GameObject({
      scene,
      object,
    });

    for (const Component of gameObjectComponentsData) {
      const Components = { ...InternalComponents };

      if (!Components[Component.name as keyof typeof Components]) {
        logger({ message: `Component: ${Component.name} not found in Components index.`, type: 'error' });
        continue;
      }
      //@ts-expect-error - Dynamic instantiation with options
      const component = new Components[Component.name](gameObject, Component.options) as GameObjectComponent;
      gameObject.addComponent(Component.name, component);
    }

    return gameObject;
  } else {
    logger({ message: `No GameObject components found for object: ${object.name}`, type: 'info' });
    return null;
  }
}