import * as THREE from 'three';
import { GameObject, GameObjectComponent } from '@tgdf';

import { ModelRenderer } from './ModelRenderer';
import { DamageHitbox } from '../gameObjects/DamageHitbox';

export class DamageHitboxController extends GameObjectComponent {
  private _modelRenderer: ModelRenderer;
  private _attackHitbox: DamageHitbox | null = null;

  constructor(gameObject: GameObject, modelRenderer: ModelRenderer) {
    super(gameObject);
    this._modelRenderer = modelRenderer;
  }

  public attachDamageHitbox(size: THREE.Vector3, damage: number, parentName: string): void {
    if (this._attackHitbox || !this.scene) return;
    this._attackHitbox = new DamageHitbox(this.scene, size, this.gameObject, damage);

    this._modelRenderer.addAttachment({
      object: this._attackHitbox,
      parentName: parentName,
    });
  }

  public removeDamageHitbox(): void {
    if (!this._attackHitbox || !this.scene) return;
    this._modelRenderer.removeAttachment(this._attackHitbox);
    this._attackHitbox = null;
  }
}
