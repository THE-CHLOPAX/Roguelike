import * as THREE from 'three';
import { GameObject, logger, RigidBody, RigidBodyOptions, Scene } from '@tgdf';

import { ModelRenderer } from '../gameObjectComponents/ModelRenderer';
import { StateController } from '../gameObjectComponents/StateController';
import { AnimationController } from '../gameObjectComponents/AnimationController';

export type EntityOptions = {
  model: THREE.Object3D;
  rigidBodyOptions?: RigidBodyOptions;
};

const ROTATION_LERP_FACTOR = 0.1; // Adjust for faster/slower rotation
const RIGID_BODY_COMPONENT_ID = 'RigidBodyComponent';

export class Entity extends GameObject {
  private _animationController: AnimationController;
  private _modelRenderer: ModelRenderer;
  private _stateController: StateController;

  private _rigidBody: RigidBody | null = null;
  private _currentRotation: number = 0;
  private _options: EntityOptions;

  constructor(scene: Scene, options: EntityOptions) {
    super({ scene });

    this._options = options;

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

    this._rigidBody = this.addComponent(
      RIGID_BODY_COMPONENT_ID,
      new RigidBody(this, this._options.rigidBodyOptions)
    );

    this._stateController = this.addComponent('StateController', new StateController(this));
  }

  public get stateController(): StateController {
    return this._stateController;
  }

  public get modelRenderer(): ModelRenderer {
    return this._modelRenderer;
  }

  public get animationController(): AnimationController {
    return this._animationController;
  }

  public get rigidBody(): RigidBody | null {
    return this._rigidBody;
  }

  public toggleDebug(enabled: boolean): void {
    this._rigidBody?.toggleDebug(enabled);
  }

  public rotateTowards(direction: THREE.Vector3): void {
    if (!this._rigidBody) {
      logger({
        message: 'Cannot rotate using Rigidbody because it is not initialized.',
        type: 'error',
      });
      return;
    }

    if (direction.x !== 0 || direction.z !== 0) {
      const targetRotation = Math.atan2(direction.x, direction.z);

      // Lerp rotation for smooth turning
      const delta = targetRotation - this._currentRotation;
      // Find the shortest angle difference and normalize to [-PI, PI]
      const shortestAngle = Math.atan2(Math.sin(delta), Math.cos(delta));
      this._currentRotation += shortestAngle * ROTATION_LERP_FACTOR;

      // Sync rotation to physics body so it's not overwritten
      this._rigidBody.setEulerRotation(new THREE.Euler(0, this._currentRotation, 0));
    }
  }
}
