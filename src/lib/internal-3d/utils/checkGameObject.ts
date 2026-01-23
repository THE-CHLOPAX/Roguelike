import * as THREE from 'three';
import { GameObject } from '@tgdf';

export function checkGameObject(obj: THREE.Object3D): obj is GameObject {
    return 'gameObjectComponents' in obj.userData && obj.userData.gameObjectComponents.length > 0;
}