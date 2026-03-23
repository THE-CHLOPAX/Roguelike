import * as THREE from 'three';
import { compareFloats, Scene } from '@tgdf';

import { HumanoidStates } from '../../types';
import { ModelRenderer } from '../gameObjectComponents/ModelRenderer';
import { StateController } from '../gameObjectComponents/StateController';
import { MovableGameObject, MovableGameObjectOptions } from './MovableGameObject';
import { AnimationController } from '../gameObjectComponents/AnimationController';

export type HumanoidOptions = MovableGameObjectOptions & {
  model: THREE.Object3D;
};

export class Humanoid extends MovableGameObject {
  private _animationController: AnimationController;
  private _modelRenderer: ModelRenderer;
  private _stateController: StateController<HumanoidStates>;

  constructor(scene: Scene, options: HumanoidOptions) {
    super(scene, options);

    this._modelRenderer = this.addComponent(
      'ModelRenderer',
      new ModelRenderer(this, {
        model: options.model,
      })
    );
    this._animationController = this.addComponent(
      'AnimationController',
      new AnimationController(this, this._modelRenderer)
    );

    this._stateController = this.addComponent(
      'StateController',
      new StateController(this, { initialState: HumanoidStates.IDLE })
    );

    this._bindAnimationsToStates();
  }

  public get modelRenderer(): ModelRenderer {
    return this._modelRenderer;
  }

  public get animationController(): AnimationController {
    return this._animationController;
  }

  public get stateController(): StateController<HumanoidStates> {
    return this._stateController;
  }

  public attack(variant: '1' | '2' | '3' | '4'): void {
    this._stateController.setState(HumanoidStates[`ATTACKING_${variant}`]);
  }

  protected override onUpdate(_deltaTime: number): void {
    this._transitionVelocityBasedState();
  }

  private _transitionVelocityBasedState(): void {
    // Velocity - based state transitions
    if (!this.velocity) return;

    const velocity = this.velocity.length();
    const velocityEpsilon = 0.01;
    const walkTreshold = 0.1;

    if (
      compareFloats(velocity, '>=', walkTreshold, velocityEpsilon) &&
      compareFloats(velocity, '<', this.defaultSpeed, velocityEpsilon)
    ) {
      this.stateController.setState(HumanoidStates.WALKING);
    } else if (
      compareFloats(velocity, '>=', this.defaultSpeed, velocityEpsilon) &&
      compareFloats(velocity, '<', this.sprintSpeed, velocityEpsilon)
    ) {
      this.stateController.setState(HumanoidStates.RUNNING);
    } else if (compareFloats(velocity, '>=', this.sprintSpeed, velocityEpsilon)) {
      this.stateController.setState(HumanoidStates.SPRINTING);
    } else if (
      this.stateController.currentState !== HumanoidStates.ATTACKING_1 &&
      this.stateController.currentState !== HumanoidStates.ATTACKING_2 &&
      this.stateController.currentState !== HumanoidStates.ATTACKING_3 &&
      this.stateController.currentState !== HumanoidStates.ATTACKING_4 &&
      this.stateController.currentState !== HumanoidStates.JUMPING &&
      this.stateController.currentState !== HumanoidStates.FALLING &&
      this.stateController.currentState !== HumanoidStates.DYING
    ) {
      this.stateController.setState(HumanoidStates.IDLE);
    }
  }

  private _bindAnimationsToStates(): void {
    this.animationController.playAnimation(this.stateController.currentState as HumanoidStates);

    this.stateController.gameObject.events.on('state:statechange', ({ newState }) => {
      this.animationController.playAnimation(newState as HumanoidStates);
    });
  }
}
