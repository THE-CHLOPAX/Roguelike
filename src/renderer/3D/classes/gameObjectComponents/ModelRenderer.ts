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

  public getModel(): THREE.Object3D | null {
    return this._model;
  }

  public setModel(model: THREE.Object3D | null): void {
    if (model === this._model) return;

    if (this._model) {
      this.gameObject.remove(this._model);
    }

    this._model = model;
    this.onModelChange(this._model);

    if (this._model) {
      this.gameObject.add(this._model);
    }
  }

  public onModelChange(_newModel: THREE.Object3D | null): void {}
}
