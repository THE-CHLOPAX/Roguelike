import { gsap } from 'gsap';
import * as THREE from 'three';
import { GameObject, RigidBodyCollisionCallback, RigidBodyCollisionParams } from '@tgdf';

import { COLORS } from 'renderer/constants';

import { Entity } from '../../../Entity';
import { Projectile } from '../../../Projectile';
import { Explosion, ExplosionOptions } from '../../../Explosion';

const SACRED_ORB_COLOR = COLORS.GOLDEN;
const SACRED_ORB_SPAWN_DURATION = 1.8;
const SACRED_ORB_SPAWN_RISE_OFFSET = -1;
const SACRED_ORB_COLLIDER_SIZE = 0.8;

export type SacredOrbOptions = {
  speed: number;
  maxRange: number;
  explosionOptions: Omit<ExplosionOptions, 'position'>;
};

export class SacredOrb extends Projectile {
  private _strikeCollisionUnsubscribe: (() => void) | null = null;
  private _material: THREE.Material;
  private _light: THREE.PointLight | null = null;

  constructor(
    private _caller: Entity,
    public options: SacredOrbOptions
  ) {
    const geometry = new THREE.SphereGeometry(0.2, 8, 8);
    const material = new THREE.MeshStandardMaterial({
      color: SACRED_ORB_COLOR,
      emissive: SACRED_ORB_COLOR,
      emissiveIntensity: 4,
      metalness: 0.4,
      roughness: 0.2,
    });
    const model = new THREE.Mesh(geometry, material);

    super(_caller.scene, {
      sender: _caller,
      speed: 15,
      maxRange: 15,
      model,
      rigidBodyOptions: {
        colliderShape: 'sphere',
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

    this._light = this.scene.lightPool.acquire(this);
    if (this._light) {
      this._light.color.set(SACRED_ORB_COLOR);
      this._light.intensity = 1.2;
      this._light.distance = 1.2;
      this._light.decay = 2;
    }

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

    this.scene.lightPool.release(this._light);
    this._light = null;
  }

  protected override onCollision({ otherBody, started }: RigidBodyCollisionParams): boolean {
    if (
      !started ||
      this._collidedWithSender(otherBody.gameObject) ||
      this._collidedWithOtherOrb(otherBody.gameObject)
    )
      return false;
    this._explodeOrb();
    return true;
  }

  protected override onMaxRangeReached(): void {
    this._explodeOrb();
  }

  private _strikeCollisionHandler: RigidBodyCollisionCallback = ({ started }) => {
    if (!started) return;

    if (this._strikeCollisionUnsubscribe !== null) {
      this._strikeCollisionUnsubscribe();
      this._strikeCollisionUnsubscribe = null;
    }

    this.scene.attach(this);

    const directionVector = new THREE.Vector3();
    this._caller.getWorldDirection(directionVector);

    this.sendTowards(directionVector);
  };

  private _explodeOrb = () => {
    const position = this.position.clone();
    this.scene.remove(this);

    const explosion = new Explosion(this.scene, {
      position,
      ...this.options.explosionOptions,
    });

    this.scene.add(explosion);
  };

  private _collidedWithSender(otherGameObject: GameObject): boolean {
    return (
      otherGameObject === this.sender || this.sender.getObjectById(otherGameObject.id) !== undefined
    );
  }

  private _collidedWithOtherOrb(otherGameObject: GameObject): boolean {
    return otherGameObject instanceof SacredOrb || otherGameObject.parent instanceof SacredOrb;
  }
}
