import * as THREE from 'three';
import { GameObject, Scene, RigidBody } from '@tgdf';
import { RigidBodyCollisionCallback } from '@tgdf/internal-game-components/RigidBody';

export class Hitbox extends GameObject {
  private _rigidBody: RigidBody | null = null;

  constructor(scene: Scene, size: THREE.Vector3) {
    super({ scene });

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size.x, size.y, size.z),
      new THREE.MeshBasicMaterial({ visible: false })
    );

    mesh.visible = false; // Ensure the hitbox mesh is invisible

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

    this._rigidBody.toggleDebug(true);
  }

  public getRigidBody(): RigidBody | null {
    return this._rigidBody;
  }

  public addCollisionListener(id: string, callback: RigidBodyCollisionCallback): void {
    this._rigidBody?.addCollisionListener(id, callback);
  }

  public getDebugMesh(): THREE.Mesh | null {
    return this._rigidBody?.getDebugMesh() || null;
  }

  public removeCollisionListener(id: string): void {
    this._rigidBody?.removeCollisionListener(id);
  }

  public toggleDebug(enabled: boolean): void {
    this._rigidBody?.toggleDebug(enabled);
  }
}
