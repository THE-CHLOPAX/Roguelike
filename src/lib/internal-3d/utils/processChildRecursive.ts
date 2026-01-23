import * as THREE from 'three';
import { logger } from '@tgdf';

import { Scene } from '../Scene/Scene';
import { SceneEventsMap } from '../types/scene';
import { checkGameObject } from './checkGameObject';
import { convertGameObject } from './convertGameObject';

export function processChildRecursive<T extends SceneEventsMap = SceneEventsMap>(child: THREE.Object3D, parent: THREE.Object3D | Scene, scene: Scene<T>): void {
    if (checkGameObject(child)) {
        // Remove the original child from its parent before converting
        child.removeFromParent();

        const gameObject = convertGameObject(child, scene);

        if (!gameObject) {
            logger({ message: `Failed to convert object ${child.name} to GameObject`, type: 'error' });
            return;
        }

        // Recursively process the GameObject's children
        [...child.children].forEach((grandChild) => {
            processChildRecursive(grandChild, gameObject, scene);
        });

        parent.add(gameObject);
    } else {
        // Recursively process regular object's children
        [...child.children].forEach((grandChild) => {
            processChildRecursive(grandChild, child, scene);
        });

        // Only add if it's not already a child (prevents duplicates)
        if (child.parent !== parent) {
            parent.add(child);
        }
    }
};