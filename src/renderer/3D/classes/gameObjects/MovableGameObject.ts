import * as THREE from 'three';
import { GameObject, RigidBody, RigidBodyOptions, Scene } from '@tgdf';

export type MovableGameObjectOptions = {
  speed: number;
  sprintSpeed?: number;
  rigidBodyOptions?: RigidBodyOptions;
};

export class MovableGameObject extends GameObject {
  public defaultSpeed: number;
  public sprintSpeed: number;

  private _currentSpeed: number;
  private _rigidBody: RigidBody;
  private _currentRotation: number = 0;
  private _movementDisabled: boolean = false;

  constructor(scene: Scene, options: MovableGameObjectOptions) {
    super({ scene });

    this.defaultSpeed = options.speed;
    this.sprintSpeed = options.sprintSpeed ?? options.speed;

    this._currentSpeed = this.defaultSpeed;

    this._rigidBody = this.addComponent(
      'RigidBodyComponent',
      new RigidBody(this, options.rigidBodyOptions)
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

  public get movementDisabled(): boolean {
    return this._movementDisabled;
  }

  public toggleSprint(enabled: boolean): void {
    this._currentSpeed = enabled ? this.sprintSpeed : this.defaultSpeed;
  }

  public toggleMovementDisabled(disabled: boolean): void {
    this._movementDisabled = disabled;
  }

  public move(direction: THREE.Vector3): void {
    if (this._movementDisabled) return;

    const velocity = direction.clone().multiplyScalar(this._currentSpeed);

    // Preserve Y velocity (gravity)
    const currentVelocity = this._rigidBody.getLinearVelocity();
    if (currentVelocity) {
      velocity.y = currentVelocity.y;
    }

    // Rotate the object to face the movement direction (only if moving)
    if (direction.x !== 0 || direction.z !== 0) {
      const targetRotation = Math.atan2(direction.x, direction.z);

      // Lerp rotation for smooth turning (adjust 0.1 to control turn speed)
      let delta = targetRotation - this._currentRotation;

      // Normalize the angle difference to [-PI, PI] for shortest rotation path
      while (delta > Math.PI) delta -= 2 * Math.PI;
      while (delta < -Math.PI) delta += 2 * Math.PI;

      this._currentRotation += delta * 0.1;

      // Sync rotation to physics body so it's not overwritten
      this._rigidBody.setEulerRotation(new THREE.Euler(0, this._currentRotation, 0));
    }

    this._rigidBody.setLinearVelocity(velocity);
  }
}
