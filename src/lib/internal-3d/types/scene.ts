import * as THREE from 'three';
import { AssetState, KeyboardInput, MouseInput } from '@tgdf';

export type SceneConstructorOptions = {
    assets?: {
        imageCache?: AssetState['imageCache']
        textureCache?: AssetState['textureCache']
        audioCache?: AssetState['audioCache']
        fontCache?: AssetState['fontCache']
        modelCacheJSON?: AssetState['modelCacheJSON']
    }
    physics?: {
        gravity: THREE.Vector3
    },
    keyboardHandlers?: KeyboardInput,
    mouseHandlers?: MouseInput,
}

export type SceneEventsMap = {
    'update': { deltaTime: number };
}