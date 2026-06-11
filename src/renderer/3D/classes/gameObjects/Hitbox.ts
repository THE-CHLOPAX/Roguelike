import * as THREE from 'three';
import { GameObject, Scene, RigidBody } from '@tgdf';

export class Hitbox extends GameObject {
  private _rigidBody: RigidBody;

  constructor(scene: Scene, size: THREE.Vector3) {
    super({ scene });

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size.x, size.y, size.z),
      new THREE.MeshBasicMaterial()
    );

    mesh.visible = false;

    this.add(mesh);

    this.name = 'Hitbox';
    this._rigidBody = this.addComponent(
      'RigidBodyComponent',
      new RigidBody(this, {
        type: 'kinematic',
        mass: 0.1,
        friction: 0,
        restitution: 0,
        linearDamping: 0,
        angularDamping: 0,
        lockRotation: true,
        sensor: true,
        enableCollisionDetection: true,
        colliderShape: 'box',
      })
    );
  }

  public get rigidBody(): RigidBody {
    return this._rigidBody;
  }
}
