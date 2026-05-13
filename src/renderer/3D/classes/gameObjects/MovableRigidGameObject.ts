import * as THREE from 'three';
import { GameObject, GameObjectComponent, logger, RigidBody, RigidBodyOptions, Scene } from '@tgdf';

import { NavMeshAgent } from '../gameObjectComponents/NavMeshAgent';

export type MovableRigidGameObjectOptions = {
  speed: number;
  sprintSpeed?: number;
  walkSpeed?: number;
  rigidBodyOptions?: RigidBodyOptions;
};

const ROTATION_LERP_FACTOR = 0.1; // Adjust for faster/slower rotation
const RIGID_BODY_COMPONENT_ID = 'RigidBodyComponent';

export class MovableRigidGameObject extends GameObject {
  public defaultSpeed: number;
  public sprintSpeed: number;
  public walkSpeed: number;

  private _currentSpeed: number;
  private _rigidBody: RigidBody | null = null;
  private _navMeshAgent?: NavMeshAgent;
  private _currentRotation: number = 0;
  private _movementDisabled: boolean = false;

  private _currentMovementTarget: THREE.Vector3 | null = null;

  private _options: MovableRigidGameObjectOptions;

  constructor(scene: Scene, options: MovableRigidGameObjectOptions) {
    super({ scene });

    this.defaultSpeed = options.speed;
    this.sprintSpeed = options.sprintSpeed ?? options.speed;
    this.walkSpeed = options.walkSpeed ?? options.speed * 0.5;

    this._options = options;

    this._currentSpeed = this.defaultSpeed;

    this._rigidBody = this.addComponent(
      RIGID_BODY_COMPONENT_ID,
      new RigidBody(this, this._options.rigidBodyOptions)
    );
  }

  public get currentSpeed(): number {
    return this._currentSpeed;
  }

  public get velocity(): THREE.Vector3 | null {
    if (this._navMeshAgent) {
      return this._navMeshAgent.velocity;
    } else if (this._rigidBody) {
      return this._rigidBody.getLinearVelocity();
    } else {
      return null;
    }
  }

  public get isMoving(): boolean {
    const velocity = this.velocity;
    return velocity ? velocity.length() > 0.1 : false;
  }

  public get rigidBody(): RigidBody | null {
    return this._rigidBody;
  }

  public get movementDisabled(): boolean {
    return this._movementDisabled;
  }

  public override addComponent<C extends GameObjectComponent>(name: string, component: C): C {
    const addedComponent = super.addComponent(name, component);

    // If the added component is a NavMeshAgent, keep a reference to it
    if (component instanceof NavMeshAgent) {
      this._navMeshAgent = component;
    }

    return addedComponent;
  }

  public toggleSprint(enabled: boolean): void {
    this._currentSpeed = enabled ? this.sprintSpeed : this.defaultSpeed;
  }

  public toggleMovementDisabled(disabled: boolean): void {
    this._movementDisabled = disabled;
  }

  public toggleDebug(enabled: boolean): void {
    this._rigidBody?.toggleDebug(enabled);
  }

  public move(direction: THREE.Vector3, speed = this._currentSpeed): void {
    if (this._movementDisabled) return;

    // Check if the movement should be controlled by NavMeshAgent
    if (this._navMeshAgent) {
      this._navMeshAgent.requestMoveDirection(direction, speed);
    }
    // Else, use standard Rigidbody movement
    else {
      this._moveRigidbody(direction, speed);
    }
  }

  public moveTo(position: THREE.Vector3, speed = this.defaultSpeed): void {
    if (this.movementDisabled) return;

    // Check if we should use pathfinding via the NavMeshAgent
    if (this._navMeshAgent) {
      this._navMeshAgent.requestMoveTarget(position, speed);
    }
    // Else, set a simple straight-line movement towards the target using Rigidbody
    else {
      this._moveRigidBodyToPosition(position, speed);
    }
  }

  public resetMovementTarget(): void {
    this._currentMovementTarget = null;
  }

  public rotateTowards(direction: THREE.Vector3): void {
    if (!this._rigidBody) {
      logger({
        message: 'Cannot rotate using Rigidbody because it is not initialized.',
        type: 'error',
      });
      return;
    }

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
  }

  protected override onUpdate(deltaTime: number): void {
    super.onUpdate(deltaTime);

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
    if (!this._rigidBody) {
      logger({
        message: 'Cannot move using Rigidbody because it is not initialized.',
        type: 'error',
      });
      return;
    }

    const velocity = direction.clone().multiplyScalar(speed);

    // Preserve Y velocity (gravity)
    const currentVelocity = this._rigidBody.getLinearVelocity();
    if (currentVelocity) {
      velocity.y = currentVelocity.y;
    }

    // Rotate the object to face the movement direction (only if moving)
    this.rotateTowards(direction);

    this._rigidBody.setLinearVelocity(velocity);
  }

  private _moveRigidBodyToPosition(position: THREE.Vector3, speed: number): void {
    this._currentMovementTarget = position.clone();
    this._currentSpeed = speed;
  }
}
