import * as THREE from 'three';
import { GameObject, RigidBody, Scene } from '@tgdf';

export class RigidFloorObject extends GameObject {
  constructor(scene: Scene, object: THREE.Object3D) {
    super({
      scene,
    });

    this.add(object);

    const bbox = new THREE.Box3().setFromObject(object);
    const floorSize = bbox.getSize(new THREE.Vector3());

    this.addComponent(
      'RigidBodyComponent',
      new RigidBody(this, {
        type: 'static',
        enableCollisionDetection: true,
        colliderSize: new THREE.Vector3(floorSize.x, 0.1, floorSize.z),
      })
    );
  }
}
