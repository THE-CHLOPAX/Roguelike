import * as THREE from 'three';
import { GameObject, RigidBody, Scene } from '@tgdf';
import { ShapeType } from '@dimforge/rapier3d-compat';

export class ControlledBox extends GameObject {
  constructor(scene: Scene) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;

    super({
      scene,
      object: mesh,
    });

    const rigidBodyComponent = this.addComponent(
      'RigidBodyComponent',
      new RigidBody(this, {
        mass: 1,
        colliderShape: ShapeType.Cuboid,
        type: 'dynamic',
      })
    );
  }
}
