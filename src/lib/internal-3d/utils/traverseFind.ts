import * as THREE from 'three';

export function traverseFind<T extends THREE.Object3D>(
    object: THREE.Object3D, predicate: (obj: THREE.Object3D) => boolean
): T | undefined {
    let result: T | undefined = undefined;
    object.traverse((child) => {
        if (predicate(child)) {
            result = child as T;
        }
    });

    return result;
}