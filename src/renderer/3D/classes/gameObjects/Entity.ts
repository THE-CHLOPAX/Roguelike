import * as THREE from 'three';
import { GameObject, getModelFromStore, RigidBody, RigidBodyOptions, Scene } from '@tgdf';

import { StateController } from '../gameObjectComponents/StateController';
import { MovementController } from '../gameObjectComponents/MovementController';
import { ModelRenderer } from '../gameObjectComponents/ModelRenderer/ModelRenderer';
import { DamageHitboxController } from '../gameObjectComponents/DamageHitboxController';
import { HealthPointsController } from '../gameObjectComponents/HealthPointsController';
import {
  AnimationController,
  AnimationControllerOptions,
} from '../gameObjectComponents/AnimationController/AnimationController';

export type EntityMovementOptions = {
  speed?: number;
  sprintSpeed?: number;
  walkSpeed?: number;
};

export type EntityOptions = {
  model: {
    id: string;
    scale?: THREE.Vector3;
  };
  healthOptions?: {
    initialHealthPoints?: number;
  };
  rigidBodyOptions?: RigidBodyOptions;
  animationControllerOptions?: AnimationControllerOptions;
  movementOptions?: EntityMovementOptions;
};

const RIGID_BODY_COMPONENT_ID = 'RigidBodyComponent';

export class Entity extends GameObject {
  public rigidBody: RigidBody;
  public modelRenderer: ModelRenderer;
  public stateController: StateController;
  public animationController: AnimationController;
  public damageHitboxController: DamageHitboxController;
  public healthPointsController: HealthPointsController;
  public movementController: MovementController;
  public defaultSpeed: number;
  public sprintSpeed: number;
  public walkSpeed: number;

  private _spawnPosition: THREE.Vector3 = new THREE.Vector3();

  constructor(
    scene: Scene,
    public options: EntityOptions
  ) {
    super({ scene });

    const model = getModelFromStore(options.model.id);
    if (!model) {
      throw new Error(`Model not found in cache: ${options.model.id}`);
    }

    if (options.model.scale) {
      model.scale.copy(options.model.scale);
    }

    const speed = options.movementOptions?.speed ?? 0;
    this.defaultSpeed = speed;
    this.sprintSpeed = options.movementOptions?.sprintSpeed ?? speed;
    this.walkSpeed = options.movementOptions?.walkSpeed ?? speed * 0.5;

    this.modelRenderer = this.addComponent(
      'ModelRenderer',
      new ModelRenderer(this, {
        model,
      })
    );

    this.animationController = this.addComponent(
      'AnimationController',
      new AnimationController(this, this.modelRenderer, options.animationControllerOptions)
    );

    this.rigidBody = this.addComponent(
      RIGID_BODY_COMPONENT_ID,
      new RigidBody(this, this.options.rigidBodyOptions)
    );

    this.movementController = this.addComponent(
      'MovementController',
      new MovementController(this)
    );

    this.healthPointsController = this.addComponent(
      'HealthPointsController',
      new HealthPointsController(this, options.healthOptions?.initialHealthPoints)
    );

    this.damageHitboxController = this.addComponent(
      'DamageHitboxController',
      new DamageHitboxController(this)
    );

    this.stateController = this.addComponent('StateController', new StateController(this));
  }

  public get spawnPosition(): THREE.Vector3 {
    return this._spawnPosition.clone();
  }

  protected override onAwake(): void {
    this._spawnPosition.copy(this.position);
  }
}
