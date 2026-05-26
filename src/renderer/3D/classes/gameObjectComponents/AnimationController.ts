import * as THREE from 'three';
import { GameObject, GameObjectComponent, logger } from '@tgdf';

import { ModelRenderer } from './ModelRenderer';

export type AnimationEvent = {
  type: string;
  action: THREE.AnimationAction;
  direction: number;
};

export type AnimationPlayOptions = {
  playbackRate?: number;
  loop?: boolean;
  clampWhenFinished?: boolean;
  onComplete?: () => void;
};
export class AnimationController extends GameObjectComponent {
  private _currentAction: THREE.AnimationAction | null = null;
  private _currentActionOnComplete: ((event?: THREE.Event) => void) | null = null;
  private _animations: THREE.AnimationClip[] = [];
  private _animationMixer: THREE.AnimationMixer | null = null;
  private _actions: Map<string, THREE.AnimationAction> = new Map();

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

  public playAnimation(animationName: string, options?: AnimationPlayOptions): void {
    const action = this._getAnimationAction(animationName);
    if (!action) return;

    // If already playing this animation, don't restart it
    if (this._currentAction === action && action.isRunning()) {
      return;
    }

    // Fade out and stop the previous action
    if (this._currentAction && this._currentAction !== action) {
      this._currentAction.fadeOut(0.2);
      this._onActionInterrupted(this._currentAction);
    }

    // Apply playback rate if specified
    if (options?.playbackRate !== undefined) {
      const baseDuration = action.getClip().duration;
      action.setDuration(baseDuration / options.playbackRate);
    }

    if (options?.loop === true) {
      action.setLoop(THREE.LoopRepeat, Infinity);
    } else {
      action.setLoop(THREE.LoopOnce, 0);
    }

    action.clampWhenFinished = options?.clampWhenFinished ?? false;

    // Reset and play the new action
    this._currentAction = action;

    this._currentActionOnComplete = options?.onComplete ?? null;

    action.reset();
    action.fadeIn(0.2);
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
    this._currentAction = null;
    action.stop();
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

  private _getAnimationAction(animationName: string): THREE.AnimationAction | null {
    if (!this._animationMixer) {
      logger({
        message: 'No animation mixer available. Make sure a model with animations is set.',
        type: 'warn',
      });
      return null;
    }

    // Return cached action if it exists
    if (this._actions.has(animationName)) {
      return this._actions.get(animationName)!;
    }

    const clip = this._animations.find((anim) => anim.name === animationName);
    if (!clip) {
      logger({
        message: `Animation "${animationName}" not found on model.`,
        type: 'warn',
      });
      return null;
    }

    // Create and cache the action
    const action = this._animationMixer.clipAction(clip);
    this._actions.set(animationName, action);
    return action;
  }

  private _initializeAnimations(model: THREE.Object3D): void {
    // Clean up existing mixer before creating a new one
    this._disposeAnimationMixer();

    this._animations = [...model.animations];
    this._animationMixer = new THREE.AnimationMixer(model);

    this._animationMixer.addEventListener('finished', (event) => {
      if (event.action === this._currentAction) {
        this._currentActionOnComplete?.(event);
        this._currentActionOnComplete = null;
      }
    });

    this._actions.clear(); // Clear cached actions
  }

  private _disposeAnimationMixer(): void {
    if (this._animationMixer) {
      this._animationMixer.stopAllAction();
      this._animationMixer.uncacheRoot(this._animationMixer.getRoot());
      this._animationMixer = null;
    }
  }

  private _onActionInterrupted(action: THREE.AnimationAction): void {
    // If the interrupted action has an onComplete callback, we should call it to ensure proper cleanup
    if (this._currentActionOnComplete && action === this._currentAction) {
      this._currentActionOnComplete();
      this._currentActionOnComplete = null;
    }
  }
}
