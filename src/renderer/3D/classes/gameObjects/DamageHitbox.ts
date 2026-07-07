import * as THREE from 'three';
import { GameObject, RigidBody, Scene } from '@tgdf';

import { HealthPointsController } from '../gameObjectComponents/HealthPointsController';

export class DamageHitbox extends GameObject {
  public rigidBody: RigidBody;

  private _damage: number;
  private _attacker: GameObject;

  constructor(scene: Scene, size: THREE.Vector3, attacker: GameObject, damage: number) {
    super({ scene });

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size.x, size.y, size.z),
      new THREE.MeshBasicMaterial()
    );

    mesh.visible = false;

    this.add(mesh);

    this.name = 'DamageHitbox';
    this._attacker = attacker;
    this._damage = damage;

    this.rigidBody = this.addComponent(
      'RigidBodyComponent',
      new RigidBody(this, {
        type: 'kinematic',
        mass: 0.1,
        friction: 0,
        restitution: 0,
        linearDamping: 0,
        angularDamping: 0,
        lockRotation: true,
        sensor: true,
        enableCollisionDetection: true,
        colliderShape: 'box',
      })
    );
  }

  public get damage(): number {
    return this._damage;
  }

  public get attacker(): GameObject {
    return this._attacker;
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
}
