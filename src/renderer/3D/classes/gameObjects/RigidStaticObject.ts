import * as THREE from 'three';
import { GameObject, RigidBody, Scene } from '@tgdf';

export type RigidStaticObjectOptions = {
  position: THREE.Vector3;
  size?: THREE.Vector3;
};

export class RigidStaticObject extends GameObject {
  private _rigidBody: RigidBody;

  constructor(scene: Scene, options: RigidStaticObjectOptions) {
    super({ scene });

    this.position.copy(options.position);

    this._rigidBody = this.addComponent(
      'RigidBodyComponent',
      new RigidBody(this, {
        type: 'static',
        enableCollisionDetection: true,
        colliderSize: options.size,
      })
    );
  }

  protected override onAwake(): void {
    super.onAwake();
    //this._rigidBody.toggleDebug(true);
  }
}
