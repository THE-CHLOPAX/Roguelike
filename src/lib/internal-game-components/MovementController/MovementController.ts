import * as THREE from 'three';
import { logger } from '@tgdf/internal-ui/utils/logger';

import { RigidBody } from '../RigidBody';
import { GameObjectComponent } from '../GameObjectComponent';
import { GameObject } from '../../internal-3d/GameObject/GameObject';
import { MOVE_TO_ARRIVAL_THRESHOLD, MOVEMENT_CONTROLLER_MESSAGES } from './constants';

const ROTATION_LERP_FACTOR = 0.1;

export type MovementControllerOptions = {
  defaultSpeed: number;
  sprintSpeed: number;
};

export class MovementController extends GameObjectComponent<MovementControllerOptions> {
  private _rigidBody: RigidBody;
  private _defaultSpeed: number;
  private _sprintSpeed: number;

  private _currentSpeed: number;
  private _movementDisabled: boolean = false;
  private _currentRotation: number = 0;

  private _currentMoveToTarget: THREE.Vector3 | null = null;
  private _currentMoveToSpeed: number;
  private _currentMoveToResolve: (() => void) | null = null;
  private _currentMoveToReject: ((reason?: unknown) => void) | null = null;

  private _currentPath: THREE.Vector3[] | null = null;
  private _currentPathIndex: number = 0;
  private _currentPathResolve: (() => void) | null = null;
  private _currentPathReject: ((reason?: unknown) => void) | null = null;

  constructor(gameObject: GameObject, rigidBody: RigidBody, options: MovementControllerOptions) {
    super(gameObject, options);

    this._rigidBody = rigidBody;
    this._defaultSpeed = options.defaultSpeed;
    this._sprintSpeed = options.sprintSpeed;
    this._currentSpeed = this._defaultSpeed;
    this._currentMoveToSpeed = this._defaultSpeed;
  }

  public get currentSpeed(): number {
    return this._currentSpeed;
  }

  public get velocity(): THREE.Vector3 {
    return this._rigidBody.getLinearVelocity();
  }

  public get isMoving(): boolean {
    return this.velocity.length() > 0.1;
  }

  public get movementDisabled(): boolean {
    return this._movementDisabled;
  }

  public toggleSprint(enabled: boolean): void {
    this._currentSpeed = enabled ? this._sprintSpeed : this._defaultSpeed;
  }

  public toggleMovementDisabled(disabled: boolean): void {
    this._movementDisabled = disabled;
  }

  public move(direction: THREE.Vector3, speed = this._currentSpeed): void {
    if (this._movementDisabled) {
      logger({
        message: MOVEMENT_CONTROLLER_MESSAGES.MOVEMENT_DISABLED,
        type: 'warn',
      });
      return;
    }

    this._moveRigidbody(direction, speed);
  }

  public moveTo(position: THREE.Vector3, speed = this._defaultSpeed): Promise<void> {
    this._rejectMovement();

    const moveToPromise = new Promise<void>((resolve, reject) => {
      this._currentMoveToTarget = position.clone();
      this._currentMoveToSpeed = speed;
      this._currentMoveToResolve = resolve;
      this._currentMoveToReject = reject;
    });

    moveToPromise.catch(() => {});

    return moveToPromise;
  }

  public resetMoveTo(): void {
    this._rejectMovement();
  }

  public moveAlongPath(path: THREE.Vector3[], speed = this._defaultSpeed): Promise<void> {
    if (path.length === 0) {
      logger({
        message: MOVEMENT_CONTROLLER_MESSAGES.PATH_LENGTH_INVALID,
        type: 'warn',
      });
      return Promise.resolve();
    }

    if (this._movementDisabled) {
      logger({
        message: MOVEMENT_CONTROLLER_MESSAGES.MOVEMENT_DISABLED,
        type: 'warn',
      });
      return Promise.resolve();
    }

    this._rejectMovement();

    const moveAlongPathPromise = new Promise<void>((resolve, reject) => {
      this._currentPath = path;
      this._currentPathIndex = 0;
      this._currentPathResolve = resolve;
      this._currentPathReject = reject;

      this._currentMoveToTarget = path[0].clone();
      this._currentMoveToSpeed = speed;
    });

    moveAlongPathPromise.catch(() => {});

    return moveAlongPathPromise;
  }

  public rotate(direction: THREE.Vector3): void {
    if (direction.x !== 0 || direction.z !== 0) {
      const targetRotation = Math.atan2(direction.x, direction.z);

      const delta = targetRotation - this._currentRotation;
      const shortestAngle = Math.atan2(Math.sin(delta), Math.cos(delta));
      this._currentRotation += shortestAngle * ROTATION_LERP_FACTOR;
    }

    this._rigidBody.setEulerRotation(new THREE.Euler(0, this._currentRotation, 0));
  }

  public rotateTowardsPosition(position: THREE.Vector3): void {
    const direction = position.clone().sub(this.gameObject.position);
    direction.y = 0;
    direction.normalize();

    this.rotate(direction);
  }

  protected override onUpdate(_deltaTime: number): void {
    if (!this._currentMoveToTarget) return;

    if (this._movementDisabled) {
      this._rejectMovement();
      return;
    }

    const distanceToTarget = this._getHorizontalDistanceTo(this._currentMoveToTarget);
    if (distanceToTarget <= MOVE_TO_ARRIVAL_THRESHOLD) {
      this._handleArrival();
      return;
    }

    const direction = this._currentMoveToTarget.clone().sub(this.gameObject.position);
    direction.y = 0;
    direction.normalize();

    this.move(direction, this._currentMoveToSpeed);
  }

  private _moveRigidbody(direction: THREE.Vector3, speed = this._currentSpeed): void {
    const velocity = direction.clone().multiplyScalar(speed);
    velocity.y = this._rigidBody.getLinearVelocity().y;

    this.rotate(direction);

    this._rigidBody.setLinearVelocity(velocity);
  }

  private _getHorizontalDistanceTo(target: THREE.Vector3): number {
    const dx = this.gameObject.position.x - target.x;
    const dz = this.gameObject.position.z - target.z;

    return Math.sqrt(dx * dx + dz * dz);
  }

  private _handleArrival(): void {
    if (this._currentPath) {
      this._currentPathIndex++;
      if (this._currentPathIndex === this._currentPath.length) {
        this._currentPathResolve?.();
        this._clearPathState();
        this._clearMoveToState();
        this._stopHorizontalMovement();
        return;
      }

      this._currentMoveToTarget = this._currentPath[this._currentPathIndex].clone();
      return;
    }

    this._currentMoveToResolve?.();
    this._clearMoveToState();
    this._stopHorizontalMovement();
  }

  private _rejectMovement(): void {
    const cancelledError = new Error(MOVEMENT_CONTROLLER_MESSAGES.MOVE_TO_CANCELLED);

    if (this._currentPath) {
      this._currentPathReject?.(cancelledError);
      this._clearPathState();
    }

    this._currentMoveToReject?.(cancelledError);
    this._clearMoveToState();
    this._stopHorizontalMovement();
  }

  private _clearMoveToState(): void {
    this._currentMoveToTarget = null;
    this._currentMoveToResolve = null;
    this._currentMoveToReject = null;
    this._currentMoveToSpeed = this._defaultSpeed;
  }

  private _clearPathState(): void {
    this._currentPath = null;
    this._currentPathIndex = 0;
    this._currentPathResolve = null;
    this._currentPathReject = null;
  }

  private _stopHorizontalMovement(): void {
    const velocity = this._rigidBody.getLinearVelocity();
    velocity.x = 0;
    velocity.z = 0;
    this._rigidBody.setLinearVelocity(velocity);
  }
}
