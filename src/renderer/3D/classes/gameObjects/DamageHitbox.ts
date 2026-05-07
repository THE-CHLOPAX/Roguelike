import * as THREE from 'three';
import { GameObject, Scene } from '@tgdf';

import { Hitbox } from './Hitbox';
import { HealthPointsController } from '../gameObjectComponents/HealthPointsController';

const SYNCED_POSITION_THRESHOLD = 0.1;

export class DamageHitbox extends Hitbox {
  private _damage: number;
  private _attacker: GameObject;
  private _isPositionSynced: boolean = false;

  constructor(scene: Scene, size: THREE.Vector3, attacker: GameObject, damage: number) {
    super(scene, size);
    this._attacker = attacker;
    this._damage = damage;
  }

  protected override onAwake(): void {
    super.onAwake();

    this.addCollisionListener(`damage-hitbox-${this.id}`, (_, otherBody, started) => {
      if (started && this._isPositionSynced) {
        const physics = this.scene?.physics;
        if (!physics) return;

        const otherObject = physics.getObjectFromBody(otherBody);
        if (otherObject === undefined || otherObject === this._attacker) return;

        const healthController = otherObject.getGameObjectComponentByType(HealthPointsController);
        if (healthController) {
          healthController.inflictDamage(this._damage);
        }
      }
    });
  }

  protected override onUpdate(deltaTime: number): void {
    super.onUpdate(deltaTime);
    const worldPosition = new THREE.Vector3();
    this.getWorldPosition(worldPosition);

    const rigidBody = this.getRigidBody();
    if (rigidBody) {
      this._isPositionSynced =
        rigidBody.getTranslation().distanceTo(worldPosition) < SYNCED_POSITION_THRESHOLD;
    }
  }

  public get damage(): number {
    return this._damage;
  }

  public get attacker(): GameObject {
    return this._attacker;
  }
}
