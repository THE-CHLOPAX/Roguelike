import * as THREE from 'three';
import { GameObject, GameObjectComponent } from '@tgdf';

export type ModelRendererOptions = {
  model: THREE.Object3D;
};
export class ModelRenderer extends GameObjectComponent {
  private _model: THREE.Object3D | null = null;

  constructor(gameObject: GameObject, options?: ModelRendererOptions) {
    super(gameObject);

    if (options?.model) {
      this.setModel(options.model);
    }
  }

  public setModel(model: THREE.Object3D): void {
    if (this._model) {
      this.gameObject.remove(this._model);
    }
    this._model = model;
    this.gameObject.add(this._model);
  }
}
