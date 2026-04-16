import * as THREE from 'three';
import { GameObject, RigidBody, Scene } from '@tgdf';

export class RigidPlane extends GameObject {
  constructor(scene: Scene, size: THREE.Vector2, material: THREE.Material, meshName?: string) {
    const geometry = new THREE.PlaneGeometry(size.x, size.y);
    const mesh = new THREE.Mesh(geometry, material);
    if (meshName) {
      mesh.name = meshName;
    }

    super({
      scene,
    });

    mesh.rotation.x = -Math.PI / 2;
    this.add(mesh);

    const rigidBody = this.addComponent(
      'RigidBodyComponent',
      new RigidBody(this, {
        type: 'static',
      })
    );

    rigidBody.toggleDebug(true);
  }
}
