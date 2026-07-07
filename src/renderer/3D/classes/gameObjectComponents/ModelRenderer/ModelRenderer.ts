import * as THREE from 'three';
import { isChildOfObject } from '@tgdf/internal-3d/utils/isChildOfObject';
import { GameObject, GameObjectComponent, logger, ResourceTracker } from '@tgdf';

import { MODEL_RENDERER_MESSAGES } from './constants';

export type ModelRendererOptions = {
  model: THREE.Object3D;
};

export type AddAttachmentOptions =
  | { object: THREE.Object3D; parent: THREE.Object3D }
  | { object: THREE.Object3D; parentName: string };

export class ModelRenderer extends GameObjectComponent {
  private _model: THREE.Object3D | null = null;
  private _modelOriginalMaterials: THREE.Material[] = [];

  constructor(gameObject: GameObject, options: ModelRendererOptions) {
    super(gameObject);

    this.setModel(options.model);
    this._modelOriginalMaterials = this.getMaterialsCopy();
  }

  public getModel(): THREE.Object3D | null {
    return this._model;
  }

  public getModelMaterials(): THREE.Material[] | null {
    if (!this._model) {
      logger({
        message: MODEL_RENDERER_MESSAGES.GET_MATERIALS_NO_MODEL,
        type: 'warn',
      });
      return null;
    }

    const materials: THREE.Material[] = [];
    this._model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          materials.push(...mesh.material);
        } else {
          materials.push(mesh.material);
        }
      }
    });

    if (materials.length === 0) {
      logger({
        message: MODEL_RENDERER_MESSAGES.GET_MATERIALS_NO_MESH,
        type: 'warn',
      });
      return null;
    }

    return materials;
  }

  public setModel(model: THREE.Object3D | null): void {
    if (model === this._model) return;

    if (this._model) {
      this.gameObject.remove(this._model);
    }

    this._model = model;

    // Clone materials to prevent shared material mutations across instances
    if (this._model) {
      this._cloneMaterials(this._model);
    }

    this.onModelChange(this._model);

    if (this._model) {
      this.gameObject.add(this._model);
    }
  }

  public getMaterialsCopy(): THREE.Material[] {
    const currentMaterials = this.getModelMaterials();
    if (!currentMaterials) return [];
    return currentMaterials.map((material) => material.clone());
  }

  public restoreOriginalMaterials(): void {
    const currentMaterials = this.getModelMaterials();

    if (!currentMaterials) return;

    currentMaterials.forEach((material, index) => {
      if (this._modelOriginalMaterials[index]) {
        material.copy(this._modelOriginalMaterials[index]);
      }
    });
  }

  private _cloneMaterials(object: THREE.Object3D): void {
    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((mat) => mat.clone());
        } else {
          mesh.material = mesh.material.clone();
        }
      }
    });
  }

  public addAttachment(options: AddAttachmentOptions): void {
    if (!this._model) {
      logger({
        message: MODEL_RENDERER_MESSAGES.ADD_ATTACHMENT_NO_MODEL,
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
        message: MODEL_RENDERER_MESSAGES.ADD_ATTACHMENT_NO_PARENT,
        type: 'warn',
      });
      return;
    }

    if (!isChildOfObject(targetParent, this._model)) {
      logger({
        message: MODEL_RENDERER_MESSAGES.ADD_ATTACHMENT_INVALID_PARENT,
        type: 'warn',
      });
      return;
    }

    ResourceTracker.trackObject(options.object);

    // Get parent's world scale to compensate for it
    const parentWorldScale = new THREE.Vector3();
    targetParent.getWorldScale(parentWorldScale);
    // Prevent division by zero if any scale component is 0
    if (parentWorldScale.x === 0) parentWorldScale.x = 1;
    if (parentWorldScale.y === 0) parentWorldScale.y = 1;
    if (parentWorldScale.z === 0) parentWorldScale.z = 1;
    // Adjust object's scale to maintain world size when attached to scaled parent
    options.object.scale.divide(parentWorldScale);

    targetParent.add(options.object);
  }

  public removeAttachment(object: THREE.Object3D): void {
    if (!this._model) {
      logger({
        message: MODEL_RENDERER_MESSAGES.REMOVE_ATTACHMENT_NO_MODEL,
        type: 'warn',
      });
      return;
    }

    if (!isChildOfObject(object, this._model)) {
      logger({
        message: MODEL_RENDERER_MESSAGES.REMOVE_ATTACHMENT_NOT_IN_HIERARCHY,
        type: 'warn',
      });
      return;
    }

    const parent = object.parent;

    if (!parent) {
      logger({
        message: MODEL_RENDERER_MESSAGES.REMOVE_ATTACHMENT_NO_PARENT,
        type: 'warn',
      });
      return;
    }

    if (object instanceof GameObject) {
      object.destroy();
    }

    parent.remove(object);
    ResourceTracker.disposeObjectResources(object);
    ResourceTracker.untrackObject(object);
  }

  public onModelChange(_newModel: THREE.Object3D | null): void {}
}
