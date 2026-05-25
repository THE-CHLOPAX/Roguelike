import * as THREE from 'three';
import { GameObjectComponent, logger, Scene } from '@tgdf';

import { Entity, EntityOptions } from './Entity';
import { NavMeshAgent } from '../gameObjectComponents/NavMeshAgent';

export type EntityMovableOptions = EntityOptions & {
  speed: number;
  sprintSpeed?: number;
  walkSpeed?: number;
};

export class EntityMovable extends Entity {
  public defaultSpeed: number;
  public sprintSpeed: number;
  public walkSpeed: number;

  private _currentSpeed: number;
  private _movementDisabled: boolean = false;
  private _navMeshAgent?: NavMeshAgent;
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
    if (this._navMeshAgent) {
      return this._navMeshAgent.velocity;
    } else if (this.rigidBody) {
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
