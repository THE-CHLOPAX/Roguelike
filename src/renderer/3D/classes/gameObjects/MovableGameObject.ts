import * as THREE from 'three';
import { GameObject, RigidBody, Scene } from '@tgdf';

export type MovableGameObjectOptions = {
  speed: number;
  sprintSpeed?: number;
  mass: number;
  friction: number;
  physicsBodyType?: RigidBody['options']['type'];
  colliderShape?: RigidBody['options']['colliderShape'];
};

export class MovableGameObject extends GameObject {
  public defaultSpeed: number;
  public sprintSpeed: number;

  private _currentSpeed: number;
  private _rigidBody: RigidBody;

  constructor(scene: Scene, options: MovableGameObjectOptions) {
    super({ scene });

    this.defaultSpeed = options.speed;
    this.sprintSpeed = options.sprintSpeed ?? options.speed;

    this._currentSpeed = this.defaultSpeed;

    this._rigidBody = this.addComponent(
      'RigidBodyComponent',
      new RigidBody(this, {
        mass: options.mass,
        friction: options.friction,
        type: options.physicsBodyType ?? 'dynamic',
        colliderShape: options.colliderShape ?? RigidBody.ShapeType.Cuboid,
      })
    );
  }

  public get speed(): number {
    return this._currentSpeed;
  }

  public get velocity(): THREE.Vector3 | null {
    return this._rigidBody.getLinearVelocity();
  }

  public get rigidBody(): RigidBody {
    return this._rigidBody;
  }

  public toggleSprint(enabled: boolean): void {
    this._currentSpeed = enabled ? this.sprintSpeed : this.defaultSpeed;
  }

  public move(direction: THREE.Vector3): void {
    const velocity = direction.clone().multiplyScalar(this._currentSpeed);

    // Preserve Y velocity (gravity)
    const currentVelocity = this._rigidBody.getLinearVelocity();
    if (currentVelocity) {
      velocity.y = currentVelocity.y;
    }

    this._rigidBody.setLinearVelocity(velocity);
  }
}
