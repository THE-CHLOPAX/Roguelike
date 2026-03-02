import * as THREE from 'three';
import { GameObject, RigidBody, Scene } from '@tgdf';

export type MovableGameObjectOptions = {
  speed: number;
  mass: number;
  friction: number;
  physicsBodyType?: RigidBody['options']['type'];
};

export class MovableGameObject extends GameObject {
  private _speed: number;
  private _rigidBody: RigidBody;

  constructor(scene: Scene, object: THREE.Object3D, options: MovableGameObjectOptions) {
    super({ scene, object });

    this._speed = options.speed;

    this._rigidBody = this.addComponent(
      'RigidBodyComponent',
      new RigidBody(this, {
        mass: options.mass,
        friction: options.friction,
        type: options.physicsBodyType ?? 'dynamic',
      })
    );
  }

  public set speed(value: number) {
    this._speed = value;
  }

  public get speed(): number {
    return this._speed;
  }

  public get velocity(): THREE.Vector3 | null {
    return this._rigidBody.getLinearVelocity();
  }

  public get rigidBody(): RigidBody {
    return this._rigidBody;
  }

  public move(direction: THREE.Vector3): void {
    const velocity = direction.clone().multiplyScalar(this._speed);

    // Preserve Y velocity (gravity)
    const currentVelocity = this._rigidBody.getLinearVelocity();
    if (currentVelocity) {
      velocity.y = currentVelocity.y;
    }

    this._rigidBody.setLinearVelocity(velocity);
  }
}
