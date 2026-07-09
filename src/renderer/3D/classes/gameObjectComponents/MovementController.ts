import * as THREE from 'three';
import { compareFloats, GameObjectComponent, logger } from '@tgdf';

import { Entity } from '../gameObjects/Entity';

const ROTATION_LERP_FACTOR = 0.1;

export class MovementController extends GameObjectComponent {
  private _currentSpeed: number;
  private _movementDisabled: boolean = false;
  private _currentRotation: number = 0;
  private _currentRotationTargetDirection: THREE.Vector3 | null = null;
  private _currentMovementTarget: THREE.Vector3 | null = null;

  constructor(gameObject: Entity) {
    super(gameObject);

    this._currentSpeed = this.gameObject.defaultSpeed;
  }

  public override get gameObject(): Entity {
    return super.gameObject as Entity;
  }

  public get currentSpeed(): number {
    return this._currentSpeed;
  }

  public get velocity(): THREE.Vector3 | null {
    const rigidBody = this.gameObject.rigidBody;
    if (rigidBody) {
      return rigidBody.getLinearVelocity();
    }
    return null;
  }

  public get isMoving(): boolean {
    const velocity = this.velocity;
    return velocity ? velocity.length() > 0.1 : false;
  }

  public get movementDisabled(): boolean {
    return this._movementDisabled;
  }

  public toggleSprint(enabled: boolean): void {
    this._currentSpeed = enabled ? this.gameObject.sprintSpeed : this.gameObject.defaultSpeed;
  }

  public toggleMovementDisabled(disabled: boolean): void {
    this._movementDisabled = disabled;
  }

  public move(direction: THREE.Vector3, speed = this._currentSpeed): void {
    if (this._movementDisabled) return;

    this._moveRigidbody(direction, speed);
  }

  public moveTo(position: THREE.Vector3, speed = this.gameObject.defaultSpeed): void {
    if (this.movementDisabled) return;
    this._moveRigidBodyToPosition(position, speed);
  }

  public rotate(direction: THREE.Vector3): void {
    const rigidBody = this.gameObject.rigidBody;
    if (!rigidBody) {
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

      const delta = targetRotation - this._currentRotation;
      const shortestAngle = Math.atan2(Math.sin(delta), Math.cos(delta));
      this._currentRotation += shortestAngle * ROTATION_LERP_FACTOR;
    }

    rigidBody.setEulerRotation(new THREE.Euler(0, this._currentRotation, 0));
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

  protected override onUpdate(_deltaTime: number): void {
    if (this._currentRotationTargetDirection) {
      this.rotate(this._currentRotationTargetDirection);
    }

    if (this._currentMovementTarget && !this._movementDisabled) {
      const direction = this._currentMovementTarget.clone().sub(this.gameObject.position);
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
    const rigidBody = this.gameObject.rigidBody;
    if (!rigidBody) {
      logger({
        message: 'Cannot move using Rigidbody because it is not initialized.',
        type: 'error',
      });
      return;
    }

    const velocity = direction.clone().multiplyScalar(speed);

    const currentVelocity = rigidBody.getLinearVelocity();
    if (currentVelocity) {
      velocity.y = currentVelocity.y;
    }

    this.rotateTowards(direction);

    rigidBody.setLinearVelocity(velocity);
  }

  private _moveRigidBodyToPosition(position: THREE.Vector3, speed: number): void {
    this._currentMovementTarget = position.clone();
    this._currentSpeed = speed;
  }
}
