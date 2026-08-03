import { gsap } from 'gsap';
import * as THREE from 'three';
import { RigidBody } from '@tgdf';

import { Entity } from '../../Entity';
import { Projectile } from '../../Projectile';

const SACRED_ORB_COLOR = 0xfffd88;
const SACRED_ORB_SPAWN_DURATION = 1.8;
const SACRED_ORB_SPAWN_RISE_OFFSET = -1;
const SACRED_ORB_COLLIDER_SIZE = 0.2;

export class SacredOrb extends Projectile {
  private _strikeCollisionUnsubscribe: (() => void) | null = null;
  private _material: THREE.Material;

  constructor(private _caller: Entity) {
    const geometry = new THREE.SphereGeometry(0.2, 8, 8);
    const material = new THREE.MeshStandardMaterial({
      color: SACRED_ORB_COLOR,
      emissive: SACRED_ORB_COLOR,
      emissiveIntensity: 4,
      metalness: 0.4,
      roughness: 0.2,
    });
    const model = new THREE.Mesh(geometry, material);

    const pointLight = new THREE.PointLight(SACRED_ORB_COLOR, 1.2, 1.2, 2);
    model.add(pointLight);

    super(_caller.scene, {
      speed: 15,
      maxRange: 15,
      model,
      rigidBodyOptions: {
        colliderShape: 'box',
        colliderSize: new THREE.Vector3(
          SACRED_ORB_COLLIDER_SIZE,
          SACRED_ORB_COLLIDER_SIZE,
          SACRED_ORB_COLLIDER_SIZE
        ),
      },
    });

    this._material = material;
  }

  /** We need to keep orb physics disabled until they are done spawning.
   * After that, they have to be externally activated to be ready to launch.
   */
  public activate(): void {
    this.rigidBody.setEnabled(true);

    const strikeCollisionId = `orb-${this.id}-strike-collision-listener`;
    this._strikeCollisionUnsubscribe = this.rigidBody.addCollisionListener(
      strikeCollisionId,
      this._strikeCollisionHandler
    );
  }

  /**
   * Sacred Orb can be launched by striking it from a specific position.
   * Vector rotation of the striking entity in world space determines the
   * direction the orb will be launched towards.
   */
  protected override onAwake(): void {
    super.onAwake();
    this.rigidBody.setEnabled(false);
    this._playSpawnAnimation();
  }

  private _playSpawnAnimation(): void {
    const targetY = this.position.y;

    this._material.transparent = true;
    this._material.opacity = 0;

    gsap.fromTo(
      this.position,
      { y: targetY + SACRED_ORB_SPAWN_RISE_OFFSET },
      {
        y: targetY,
        duration: SACRED_ORB_SPAWN_DURATION,
        ease: 'power2.out',
        onComplete: () => this.activate(),
      }
    );

    gsap.to(this._material, {
      opacity: 1,
      duration: SACRED_ORB_SPAWN_DURATION,
      ease: 'power2.out',
    });
  }

  protected override onDestroyed(): void {
    super.onDestroyed();
    if (this._strikeCollisionUnsubscribe !== null) this._strikeCollisionUnsubscribe();
  }

  private _strikeCollisionHandler = (
    _thisBody: RigidBody,
    _otherBody: RigidBody,
    started: boolean
  ) => {
    if (!started) return;

    if (this._strikeCollisionUnsubscribe !== null) {
      this._strikeCollisionUnsubscribe();
      this._strikeCollisionUnsubscribe = null;
    }

    this.scene.attach(this);

    const directionVector = new THREE.Vector3();
    this._caller.getWorldDirection(directionVector);

    this.sendTowards(directionVector, this._onCollision, this._onMaxRangeReached);
  };

  private _onCollision = () => {};

  private _onMaxRangeReached = () => {};
}
