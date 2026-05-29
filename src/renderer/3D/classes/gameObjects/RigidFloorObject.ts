import * as THREE from 'three';
import { GameObject, RigidBody, Scene } from '@tgdf';

export class RigidFloorObject extends GameObject {
  constructor(scene: Scene, object: THREE.Object3D) {
    super({
      scene,
    });

    this.add(object);

    this.addComponent(
      'RigidBodyComponent',
      new RigidBody(this, {
        type: 'static',
        enableCollisionDetection: true,
      })
    );
  }
}
