import * as THREE from 'three';
import { GameObject, RigidBody, RigidBodyOptions, Scene } from '@tgdf';

export type MovableRigidGameObjectOptions = {
  speed: number;
  sprintSpeed?: number;
  rigidBodyOptions?: RigidBodyOptions;
};

const ROTATION_LERP_FACTOR = 0.1; // Adjust for faster/slower rotation

export class MovableRigidGameObject extends GameObject {
  public defaultSpeed: number;
  public sprintSpeed: number;

  private _currentSpeed: number;
  private _rigidBody: RigidBody;
  private _currentRotation: number = 0;
  private _movementDisabled: boolean = false;

  private _currentMovementTarget: THREE.Vector3 | null = null;

  constructor(scene: Scene, options: MovableRigidGameObjectOptions) {
    super({ scene });

    this.defaultSpeed = options.speed;
    this.sprintSpeed = options.sprintSpeed ?? options.speed;

    this._currentSpeed = this.defaultSpeed;

    this._rigidBody = this.addComponent(
      'RigidBodyComponent',
      new RigidBody(this, options.rigidBodyOptions)
    );
  }

  public get currentSpeed(): number {
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

      // Lerp rotation for smooth turning
      const delta = targetRotation - this._currentRotation;
      // Find the shortest angle difference and normalize to [-PI, PI]
      const shortestAngle = Math.atan2(Math.sin(delta), Math.cos(delta));
      this._currentRotation += shortestAngle * ROTATION_LERP_FACTOR;

      // Sync rotation to physics body so it's not overwritten
      this._rigidBody.setEulerRotation(new THREE.Euler(0, this._currentRotation, 0));
    }

    this._rigidBody.setLinearVelocity(velocity);
  }

  public moveTo(position: THREE.Vector3): void {
    this._currentMovementTarget = position.clone();
  }

  public resetMovementTarget(): void {
    this._currentMovementTarget = null;
  }

  protected override onUpdate(_deltaTime: number): void {
    super.onUpdate(_deltaTime);

    if (this._currentMovementTarget && !this._movementDisabled) {
      const direction = this._currentMovementTarget.clone().sub(this.position);
      const distance = direction.length();

      if (distance > 0.1) {
        direction.normalize();
        this.move(direction);
      } else {
        this._currentMovementTarget = null;
      }
    }
  }
}
