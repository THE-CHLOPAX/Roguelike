import { gsap } from 'gsap';
import { Scene } from '@tgdf';
import * as THREE from 'three';

import { ModelRenderer } from '../gameObjectComponents/ModelRenderer';
import { AnimationController } from '../gameObjectComponents/AnimationController';
import { HealthPointsController } from '../gameObjectComponents/HealthPointsController';
import {
  MovableRigidGameObject,
  MovableRigidGameObjectOptions,
} from '../gameObjects/MovableRigidGameObject';

export type EntityOptions = MovableRigidGameObjectOptions & {
  model: THREE.Object3D;
  initialHealthPoints?: number;
};

export class Entity extends MovableRigidGameObject {
  private _modelRenderer: ModelRenderer;
  private _animationController: AnimationController;
  private _healthPointsController: HealthPointsController;

  constructor(scene: Scene, options: EntityOptions) {
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

    this._healthPointsController = this.addComponent(
      'HealthPointsController',
      new HealthPointsController(this, options.initialHealthPoints)
    );

    this._bindHealthPointsControllerEvents();
  }

  public get modelRenderer(): ModelRenderer {
    return this._modelRenderer;
  }

  public get animationController(): AnimationController {
    return this._animationController;
  }

  public get healthPointsController(): HealthPointsController {
    return this._healthPointsController;
  }

  private _bindHealthPointsControllerEvents(): void {
    // Flash red on damage
    this.healthPointsController.onDamageTaken = () => {
      const modelMaterials = this.modelRenderer.getModelMaterials();

      if (!modelMaterials) return;

      modelMaterials.forEach((material) => {
        if (!('color' in material)) return;

        const color = material.color;

        if (color instanceof THREE.Color) {
          gsap.to(color, {
            r: 1,
            g: 0,
            b: 0,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
          });
        }
      });
    };
  }
}
