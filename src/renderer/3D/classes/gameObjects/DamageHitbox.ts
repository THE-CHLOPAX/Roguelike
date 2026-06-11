import * as THREE from 'three';
import { GameObject, Scene } from '@tgdf';

import { Hitbox } from './Hitbox';
import { HealthPointsController } from '../gameObjectComponents/HealthPointsController';

export class DamageHitbox extends Hitbox {
  private _damage: number;
  private _attacker: GameObject;

  constructor(scene: Scene, size: THREE.Vector3, attacker: GameObject, damage: number) {
    super(scene, size);
    this._attacker = attacker;
    this._damage = damage;
  }

  protected override onAwake(): void {
    super.onAwake();

    this.rigidBody.addCollisionListener(`damage-hitbox-${this.id}`, (_, otherBody, started) => {
      const otherObject = otherBody.gameObject;
      if (otherObject === undefined || otherObject === this._attacker) return;
      if (started) {
        const healthController = otherObject.getGameObjectComponentByType(HealthPointsController);
        if (healthController) {
          healthController.inflictDamage(this._damage);
        }
      }
    });
  }

  public get damage(): number {
    return this._damage;
  }

  public get attacker(): GameObject {
    return this._attacker;
  }
}
