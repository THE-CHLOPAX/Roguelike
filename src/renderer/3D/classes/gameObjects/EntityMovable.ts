import * as THREE from 'three';
import { compareFloats, logger, Scene } from '@tgdf';

import { Entity, EntityOptions } from './Entity';

export type EntityMovableOptions = EntityOptions & {
  speed: number;
  sprintSpeed?: number;
  walkSpeed?: number;
};

const ROTATION_LERP_FACTOR = 0.1; // Adjust for faster/slower rotation

export class EntityMovable extends Entity {
  public defaultSpeed: number;
  public sprintSpeed: number;
  public walkSpeed: number;

  private _currentSpeed: number;
  private _movementDisabled: boolean = false;
  private _currentRotation: number = 0;

  private _currentRotationTargetDirection: THREE.Vector3 | null = null;
  private _currentMovementTarget: THREE.Vector3 | null = null;

  constructor(scene: Scene, options: EntityMovableOptions) {
    super(scene, options);

    this.defaultSpeed = options.speed;
    this.sprintSpeed = options.sprintSpeed ?? options.speed;
    this.walkSpeed = options.walkSpeed ?? options.speed * 0.5;

    this._currentSpeed = this.defaultSpeed;
  }

  public get currentSpeed(): number {
    return this._currentSpeed;
  }

  public get velocity(): THREE.Vector3 | null {
    if (this.rigidBody) {
      return this.rigidBody.getLinearVelocity();
    } else {
      return null;
    }
  }

  public get isMoving(): boolean {
    const velocity = this.velocity;
    return velocity ? velocity.length() > 0.1 : false;
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

  public move(direction: THREE.Vector3, speed = this._currentSpeed): void {
    if (this._movementDisabled) return;

    this._moveRigidbody(direction, speed);
  }

  public moveTo(position: THREE.Vector3, speed = this.defaultSpeed): void {
    if (this.movementDisabled) return;
    // Set a simple straight-line movement towards the target using Rigidbody
    this._moveRigidBodyToPosition(position, speed);
  }

  public rotate(direction: THREE.Vector3): void {
    if (!this.rigidBody) {
      logger({
        message: 'Cannot rotate using Rigidbody because it is not initialized.',
        type: 'error',
      });
      return;
    }

    if (direction.x !== 0 || direction.z !== 0) {
      const targetRotation = Math.atan2(direction.x, direction.z);

      if (compareFloats(targetRotation, '===', this._currentRotation)) {
        this._currentRotationTargetDirection = null;
        return;
      }

      // Lerp rotation for smooth turning
      const delta = targetRotation - this._currentRotation;
      // Find the shortest angle difference and normalize to [-PI, PI]
      const shortestAngle = Math.atan2(Math.sin(delta), Math.cos(delta));
      this._currentRotation += shortestAngle * ROTATION_LERP_FACTOR;
    }

    // Sync rotation to physics body so it's not overwritten
    this.rigidBody.setEulerRotation(new THREE.Euler(0, this._currentRotation, 0));
  }

  public rotateTowards(direction: THREE.Vector3): void {
    this._currentRotationTargetDirection = direction.clone();
  }

  public resetRotationTarget(): void {
    this._currentRotationTargetDirection = null;
  }

  public resetMovementTarget(): void {
    this._currentMovementTarget = null;
  }

  protected override onUpdate(deltaTime: number): void {
    super.onUpdate(deltaTime);

    if (this._currentRotationTargetDirection) {
      this.rotate(this._currentRotationTargetDirection);
    }

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

  private _moveRigidbody(direction: THREE.Vector3, speed: number): void {
    if (!this.rigidBody) {
      logger({
        message: 'Cannot move using Rigidbody because it is not initialized.',
        type: 'error',
      });
      return;
    }

    const velocity = direction.clone().multiplyScalar(speed);

    // Preserve Y velocity (gravity)
    const currentVelocity = this.rigidBody.getLinearVelocity();
    if (currentVelocity) {
      velocity.y = currentVelocity.y;
    }

    // Rotate the object to face the movement direction (only if moving)
    this.rotateTowards(direction);

    this.rigidBody.setLinearVelocity(velocity);
  }

  private _moveRigidBodyToPosition(position: THREE.Vector3, speed: number): void {
    this._currentMovementTarget = position.clone();
    this._currentSpeed = speed;
  }
}
