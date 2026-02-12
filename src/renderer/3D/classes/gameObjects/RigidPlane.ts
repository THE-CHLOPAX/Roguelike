import * as THREE from 'three';
import { GameObject, RigidBody, Scene } from '@tgdf';
import { ShapeType } from '@dimforge/rapier3d-compat';

export class RigidPlane extends GameObject {
  constructor(scene: Scene, size: THREE.Vector2, material: THREE.Material) {
    const geometry = new THREE.PlaneGeometry(size.x, size.y);
    const mesh = new THREE.Mesh(geometry, material);

    super({
      scene,
      object: mesh,
    });

    this.addComponent(
      'RigidBodyComponent',
      new RigidBody(this, {
        type: 'static',
      })
    );
  }
}
