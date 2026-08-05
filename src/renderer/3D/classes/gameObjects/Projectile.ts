import * as THREE from 'three';
import { GameObject, RigidBody, RigidBodyOptions, Scene } from '@tgdf';

import { ModelRenderer } from '../gameObjectComponents/ModelRenderer/ModelRenderer';

export type ProjectileOptions = {
  model: THREE.Object3D;
  speed: number;
  maxRange: number;
  rigidBodyOptions?: Partial<RigidBodyOptions>;
};

const DEFAULT_RIGID_OPTIONS: RigidBodyOptions = {
  colliderShape: 'box',
  enableCollisionDetection: true,
  mass: 0.1,
  type: 'kinematic',
  angularDamping: 0,
  friction: 0,
  linearDamping: 0,
  sensor: true,
  restitution: 0,
  lockRotation: true,
};

export class Projectile extends GameObject {
  public rigidBody: RigidBody;

  private _speed: number;
  private _maxRange: number;

  private _sentFromPosition: THREE.Vector3 | null = null;
  private _direction: THREE.Vector3 | null = null;
  private _onMaxRangeCallback: (() => void) | null = null;

  constructor(scene: Scene, options: ProjectileOptions) {
    super({ scene });

    this._speed = options.speed;
    this._maxRange = options.maxRange;

    this.addComponent('ModelRenderer', new ModelRenderer(this, { model: options.model }));
    this.rigidBody = this.addComponent(
      'RigidBody',
      new RigidBody(this, { ...DEFAULT_RIGID_OPTIONS, ...options.rigidBodyOptions })
    );
  }

  public sendTowards(
    direction: THREE.Vector3,
    onCollision: (collidedObject: THREE.Object3D) => void,
    onMaxRangeReached: () => void
  ) {
    this._sentFromPosition = this.getWorldPosition(new THREE.Vector3());

    this._direction = direction.normalize();

    const collisionListenerId = `projectile-on-collision-listener-${this.name || this.id}`;

    this.rigidBody.addCollisionListener(collisionListenerId, ({ otherBody, started }) => {
      if (!started) return;
      this.rigidBody.removeCollisionListener(collisionListenerId);
      onCollision(otherBody.gameObject);
    });

    this._onMaxRangeCallback = onMaxRangeReached;
  }

  protected override onUpdate(deltaTime: number): void {
    super.onUpdate(deltaTime);

    if (this._direction !== null) {
      this.position.addScaledVector(this._direction, this._speed * deltaTime);
    }

    if (
      this._sentFromPosition !== null &&
      this._onMaxRangeCallback !== null &&
      this.position.distanceTo(this._sentFromPosition) > this._maxRange
    ) {
      this._onMaxRangeCallback?.();
    }
  }
}
