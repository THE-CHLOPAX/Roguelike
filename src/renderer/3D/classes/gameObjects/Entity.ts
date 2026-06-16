import * as THREE from 'three';
import { GameObject, getModelFromStore, RigidBody, RigidBodyOptions, Scene } from '@tgdf';

import { ModelRenderer } from '../gameObjectComponents/ModelRenderer';
import { StateController } from '../gameObjectComponents/StateController';
import { DamageHitboxController } from '../gameObjectComponents/DamageHitboxController';
import { HealthPointsController } from '../gameObjectComponents/HealthPointsController';
import {
  AnimationController,
  AnimationControllerOptions,
} from '../gameObjectComponents/AnimationController';

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
};

const RIGID_BODY_COMPONENT_ID = 'RigidBodyComponent';

export class Entity extends GameObject {
  private _rigidBody: RigidBody;
  private _modelRenderer: ModelRenderer;
  private _stateController: StateController;
  private _animationController: AnimationController;
  private _damageHitboxController: DamageHitboxController;
  private _healthPointsController: HealthPointsController;

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

    this._modelRenderer = this.addComponent(
      'ModelRenderer',
      new ModelRenderer(this, {
        model,
      })
    );

    this._animationController = this.addComponent(
      'AnimationController',
      new AnimationController(this, this._modelRenderer, options.animationControllerOptions)
    );

    this._rigidBody = this.addComponent(
      RIGID_BODY_COMPONENT_ID,
      new RigidBody(this, this.options.rigidBodyOptions)
    );

    this._healthPointsController = this.addComponent(
      'HealthPointsController',
      new HealthPointsController(this, options.healthOptions?.initialHealthPoints)
    );

    this._damageHitboxController = this.addComponent(
      'DamageHitboxController',
      new DamageHitboxController(this)
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

  public get damageHitboxController(): DamageHitboxController {
    return this._damageHitboxController;
  }

  public get healthPointsController(): HealthPointsController {
    return this._healthPointsController;
  }

  public get rigidBody(): RigidBody {
    return this._rigidBody;
  }

  public get spawnPosition(): THREE.Vector3 {
    return this._spawnPosition;
  }

  protected override onAwake(): void {
    this._spawnPosition.copy(this.position);
  }
}
