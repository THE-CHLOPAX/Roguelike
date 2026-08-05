import { gsap } from 'gsap';
import * as THREE from 'three';
import {
  useAssetStore,
  GameObject,
  RigidBody,
  assert,
  RigidBodyCollisionParams,
  Scene,
} from '@tgdf';

import { ARCANE_CIRCLE_TEXTURE } from '3D/constants';
import { isPlayer } from 'renderer/3D/utils/isPlayer';
import { pixelateTexture } from '3D/utils/pixelateTexture';

export type ArcaneCircleOptions = {
  diameter: number;
  healAmount: number;
  healIntervalMs: number;
  durationMs: number;
};

const ROTATION_DURATION = 10; // seconds per full turn
const ARCANE_CIRCLE_COLOR = 0xfffd88;
const FADE_DURATION = 1; // seconds for fade in/out

export class ArcaneCircle extends GameObject {
  private _rotationTween: gsap.core.Tween | null = null;
  private _texture: THREE.Texture;
  private _fadeTimeout: NodeJS.Timeout | null = null;
  private _fadeInTween: gsap.core.Tween | null = null;
  private _rigidBody: RigidBody | null = null;
  private _collisionUnsubscribe: (() => void) | null = null;
  private _healIntervalsMap: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    scene: Scene,
    public options: ArcaneCircleOptions
  ) {
    super({ scene });

    const texture = useAssetStore.getState().textureCache.get(ARCANE_CIRCLE_TEXTURE);

    if (!texture) {
      throw new Error('Arcane circle texture not found in asset store');
    }

    this._texture = texture;
    pixelateTexture(this._texture);

    this._rigidBody = this.addComponent(
      'rigidBody',
      new RigidBody(this, {
        type: 'kinematic',
        colliderShape: 'cylinder',
        colliderSize: new THREE.Vector3(options.diameter, 1, options.diameter),
        enableCollisionDetection: true,
        sensor: true,
      })
    );

    this._rigidBody.toggleDebug(true);
  }

  protected override onAwake(): void {
    super.onAwake();

    this._rotationTween = gsap.to(this.rotation, {
      y: `+=${Math.PI * 2}`,
      duration: ROTATION_DURATION,
      repeat: -1,
      ease: 'none',
    });

    const material = new THREE.MeshStandardMaterial({
      map: this._texture,
      transparent: true,
      opacity: 0,
      emissiveMap: this._texture,
      emissive: ARCANE_CIRCLE_COLOR,
      emissiveIntensity: 1,
      roughness: 1,
      metalness: 0,
      depthWrite: false,
    });

    this._fadeInTween = gsap.to(material, {
      opacity: 1,
      duration: FADE_DURATION,
      onComplete: () => {
        this._fadeInTween = null;
      },
    });

    const geometry = new THREE.PlaneGeometry(this.options.diameter, this.options.diameter);

    const mesh = new THREE.Mesh(geometry, material);

    this.add(mesh);

    if (!this.parent) {
      throw new Error('ArcaneCircle missing parent');
    }

    const parentBbox = new THREE.Box3().setFromObject(this.parent);
    const parentHeight = parentBbox.max.y - parentBbox.min.y;
    const yOffset = -parentHeight / 2 + 0.5; // Slightly above the ground

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = this.parent.position.y + yOffset;

    const light = new THREE.PointLight(ARCANE_CIRCLE_COLOR, 0.5, 10);
    light.position.set(0, parentHeight, 0);
    this.add(light);

    this._fadeTimeout = setTimeout(() => {
      gsap.to(material, {
        opacity: 0,
        duration: FADE_DURATION,
        onComplete: () => {
          assert(this.parent !== null);
          this.parent.remove(this);
        },
      });
    }, this.options.durationMs);

    const listenerId = `arcane-circle-${this.id}-collision-listener`;
    assert(this._rigidBody, 'ArcaneCircle: RigidBody component missing');
    this._collisionUnsubscribe = this._rigidBody.addCollisionListener(
      listenerId,
      this._onCollision
    );
  }

  protected override onDestroyed(): void {
    super.onDestroyed();

    if (this._rotationTween) {
      this._rotationTween.kill();
      this._rotationTween = null;
    }

    if (this._fadeTimeout) {
      clearTimeout(this._fadeTimeout);
      this._fadeTimeout = null;
    }

    if (this._fadeInTween) {
      this._fadeInTween.kill();
      this._fadeInTween = null;
    }

    this._collisionUnsubscribe?.();

    this._healIntervalsMap.forEach((interval) => {
      clearInterval(interval);
    });
  }

  private _onCollision = ({ otherBody, started }: RigidBodyCollisionParams) => {
    const otherGameObject = otherBody.gameObject;

    if (!isPlayer(otherGameObject)) return;

    // If player leaves the aura - remove their heal interval and return
    if (!started && this._healIntervalsMap.has(otherGameObject.uuid)) {
      const interval = this._healIntervalsMap.get(otherGameObject.uuid);
      clearInterval(interval);
      this._healIntervalsMap.delete(otherGameObject.uuid);
      return;
    }

    // Start player healing interval
    this._healIntervalsMap.set(
      otherGameObject.uuid,
      setInterval(() => {
        otherGameObject.healthPointsController.healDamage(this.options.healAmount);
      }, this.options.healIntervalMs)
    );
  };
}
