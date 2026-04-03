import * as THREE from 'three';
import { compareFloats, Scene } from '@tgdf';

import { HumanoidStates, StateGroup } from '../../../types';
import { HUMANOID_STATE_MACHINE } from './humanoidStateMachine';
import { ModelRenderer } from '../../gameObjectComponents/ModelRenderer';
import { StateController } from '../../gameObjectComponents/StateController';
import { AnimationController } from '../../gameObjectComponents/AnimationController';
import { MovableRigidGameObject, MovableRigidGameObjectOptions } from '../MovableRigidGameObject';

export type HumanoidOptions = MovableRigidGameObjectOptions & {
  model: THREE.Object3D;
};

export class Humanoid extends MovableRigidGameObject {
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
      new StateController(this, {
        initialState: HumanoidStates.IDLE,
        stateConfig: HUMANOID_STATE_MACHINE,
      })
    );

    // Set up state change listener to call overridable hook
    this.events.on('state:statechange', ({ newState, previousState }) => {
      this.onStateChange(newState as HumanoidStates, previousState as HumanoidStates | null);
    });

    // Play initial state animation
    this.onStateChange(this._stateController.currentState as HumanoidStates, null);
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
    this.stateController.setState(HumanoidStates[`ATTACKING_${variant}`]);
    this.animationController.playAnimation(HumanoidStates[`ATTACKING_${variant}`], {
      clampWhenFinished: true,
      onComplete: () => {
        this.stateController.setState(HumanoidStates.IDLE);
      },
    });
  }

  public move(direction: THREE.Vector3): void {
    if (this.movementDisabled) return;
    super.move(direction);

    // If current state is an action state, clear it to
    // allow velocity-based movement states to take over, since
    // the player requested movement by providing input.
    const currentState = this.stateController.currentState;
    if (!currentState) return;
    const stateConfig = this.stateController.getStateConfig(currentState);
    if (stateConfig?.stateGroup === StateGroup.ACTION) {
      this.stateController.setState(HumanoidStates.IDLE);
    }
  }

  protected onStateChange(newState: HumanoidStates, _previousState: HumanoidStates | null): void {
    const currentStateConfig = this.stateController.getStateConfig(newState);

    if (currentStateConfig?.stateGroup === StateGroup.MOVEMENT) {
      this.animationController.playAnimation(newState, { loop: true });
    }
  }

  protected override onUpdate(deltaTime: number): void {
    super.onUpdate(deltaTime);
    this._transitionVelocityBasedState();
  }

  private _transitionVelocityBasedState(): void {
    // Only auto-transition if current state is interruptible
    if (!this._canAutoTransition()) return;

    // Velocity-based state transitions
    if (!this.velocity) return;

    const velocity = this.velocity.length();
    const velocityEpsilon = 0.01;
    const walkThreshold = 0.1;

    // Determine target movement state based on velocity
    let targetState: HumanoidStates | null = null;

    if (compareFloats(velocity, '>=', this.sprintSpeed, velocityEpsilon)) {
      targetState = HumanoidStates.SPRINTING;
    } else if (
      compareFloats(velocity, '>=', this.defaultSpeed, velocityEpsilon) &&
      compareFloats(velocity, '<', this.sprintSpeed, velocityEpsilon)
    ) {
      targetState = HumanoidStates.RUNNING;
    } else if (
      compareFloats(velocity, '>=', walkThreshold, velocityEpsilon) &&
      compareFloats(velocity, '<', this.defaultSpeed, velocityEpsilon)
    ) {
      targetState = HumanoidStates.WALKING;
    } else {
      targetState = HumanoidStates.IDLE;
    }

    if (targetState) {
      this.stateController.setState(targetState);
    }
  }

  private _canAutoTransition(): boolean {
    const currentState = this.stateController.currentState;
    if (!currentState) return true;

    const stateConfig = this.stateController.getStateConfig(currentState);
    if (!stateConfig) return true;

    return stateConfig.interruptible;
  }
}
