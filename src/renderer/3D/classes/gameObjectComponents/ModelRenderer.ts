import * as THREE from 'three';
import { GameObject, GameObjectComponent, logger } from '@tgdf';
import { isChildOfObject } from '@tgdf/internal-3d/utils/isChildOfObject';

export type ModelRendererOptions = {
  model: THREE.Object3D;
};

export type AddAttachmentOptions =
  | { object: THREE.Object3D; parent: THREE.Object3D }
  | { object: THREE.Object3D; parentName: string };
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

  public addAttachment(options: AddAttachmentOptions): void {
    if (!this._model) {
      logger({
        message: '[ModelRenderer] addAttachment failed: No model set on ModelRenderer.',
        type: 'warn',
      });
      return;
    }

    let targetParent: THREE.Object3D | null = null;
    if ('parentName' in options) {
      targetParent = this._model?.getObjectByName(options.parentName) || null;
    } else if ('parent' in options) {
      targetParent = options.parent;
    }

    if (!targetParent) {
      logger({
        message: '[ModelRenderer] addAttachment failed: No valid parent provided.',
        type: 'warn',
      });
      return;
    }

    if (!isChildOfObject(targetParent, this._model)) {
      logger({
        message:
          '[ModelRenderer] addAttachment failed: Provided parent is not part of the model hierarchy.',
        type: 'warn',
      });
      return;
    }

    this.gameObject.addObjectResourceTracker(options.object);
    targetParent.add(options.object);
  }

  public removeAttachment(object: THREE.Object3D): void {
    if (!this._model) {
      logger({
        message: '[ModelRenderer] removeAttachment failed: No model set on ModelRenderer.',
        type: 'warn',
      });
      return;
    }

    if (!isChildOfObject(object, this._model)) {
      logger({
        message:
          '[ModelRenderer] removeAttachment failed: Provided object is not part of the model hierarchy.',
        type: 'warn',
      });
      return;
    }

    const parent = object.parent;

    if (!parent) {
      logger({
        message: '[ModelRenderer] removeAttachment failed: Provided object has no parent.',
        type: 'warn',
      });
      return;
    }

    parent.remove(object);
    this.gameObject.removeObjectResourceTracker(object);
  }

  public onModelChange(_newModel: THREE.Object3D | null): void {}
}
