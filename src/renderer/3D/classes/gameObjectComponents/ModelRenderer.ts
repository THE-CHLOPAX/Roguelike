import * as THREE from 'three';
import { GameObject, GameObjectComponent, logger } from '@tgdf';

export type ModelRendererOptions = {
  model: THREE.Object3D;
};
export class ModelRenderer extends GameObjectComponent {
  private _model: THREE.Object3D | null = null;
  private _animations: THREE.AnimationClip[] = [];
  private _animationMixer: THREE.AnimationMixer | null = null;

  constructor(gameObject: GameObject, options?: ModelRendererOptions) {
    super(gameObject);

    if (options?.model) {
      this.setModel(options.model);
    }
  }

  public getAnimations(): THREE.AnimationClip[] {
    return this._animations;
  }

  public playAnimation(animationName: string): void {
    const action = this._getAnimationAction(animationName);
    if (!action) return;
    action.play();
  }

  public pauseAnimation(animationName: string): void {
    const action = this._getAnimationAction(animationName);
    if (!action) return;
    action.paused = true;
  }

  public stopAnimation(animationName: string): void {
    const action = this._getAnimationAction(animationName);
    if (!action) return;
    action.stop();
  }

  public setModel(model: THREE.Object3D | null): void {
    if (this._model) {
      this.gameObject.remove(this._model);
    }

    this._model = model;

    if (this._model) {
      this.gameObject.add(this._model);
      this._animationMixer = new THREE.AnimationMixer(this._model);
    } else {
      this._animationMixer = null;
    }

    this._animations = model?.animations ?? [];
  }

  private _getAnimationAction(animationName: string): THREE.AnimationAction | null {
    if (!this._animationMixer) {
      logger({
        message: 'No animation mixer available. Make sure a model with animations is set.',
        type: 'warn',
      });
      return null;
    }

    const clip = this._animations.find((anim) => anim.name === animationName);
    if (!clip) {
      logger({
        message: `Animation "${animationName}" not found on model.`,
        type: 'warn',
      });
      return null;
    }

    return this._animationMixer.clipAction(clip);
  }
}
