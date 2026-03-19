import * as THREE from 'three';
import { GameObject, GameObjectComponent, logger } from '@tgdf';

import { ModelRenderer } from './ModelRenderer';

export class AnimationController extends GameObjectComponent {
  private _animations: THREE.AnimationClip[] = [];
  private _animationMixer: THREE.AnimationMixer | null = null;

  constructor(gameObject: GameObject, modelRenderer: ModelRenderer) {
    super(gameObject);

    const currentModel = modelRenderer.getModel();
    if (currentModel) {
      this._initializeAnimations(currentModel);
    }

    modelRenderer.onModelChange = this._initializeAnimations.bind(this);
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

  private _initializeAnimations(model: THREE.Object3D): void {
    // Clean up existing mixer before creating a new one
    this._disposeAnimationMixer();

    this._animations = [...model.animations];
    this._animationMixer = new THREE.AnimationMixer(model);

    console.log('NEW ANIMATIONS', this._animations);
  }

  private _disposeAnimationMixer(): void {
    if (this._animationMixer) {
      this._animationMixer.stopAllAction();
      this._animationMixer.uncacheRoot(this._animationMixer.getRoot());
      this._animationMixer = null;
    }
  }

  protected override onUpdate(deltaTime: number): void {
    if (this._animationMixer) {
      this._animationMixer.update(deltaTime);
    }
  }

  protected override onDestroyed(): void {
    this._disposeAnimationMixer();
    this._animations = [];
  }
}
