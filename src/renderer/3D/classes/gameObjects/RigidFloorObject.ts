import * as THREE from 'three';
import { GameObject, RigidBody, Scene } from '@tgdf';

export type RigidFloorObjectOptions = {
  position: THREE.Vector3;
  size: THREE.Vector3;
};

export class RigidFloorObject extends GameObject {
  constructor(scene: Scene, options: RigidFloorObjectOptions) {
    super({ scene });

    this.position.copy(options.position);

    const rigidbody = this.addComponent(
      'RigidBodyComponent',
      new RigidBody(this, {
        type: 'static',
        enableCollisionDetection: true,
        colliderSize: options.size,
      })
    );

    rigidbody.toggleDebug(true);
  }
}
