import * as THREE from 'three';
import { RigidBody, useAssetStore } from '@tgdf';
import { TestScene } from 'src/renderer/scenes/test/TestScene';

import { HUMANOID_STATES } from '../../types';
import { MODEL_MONK } from '../../../constants';
import { MovableGameObject } from './MovableGameObject';
import { ModelRenderer } from '../gameObjectComponents/ModelRenderer';
import { StateController } from '../gameObjectComponents/StateController';
import { WSADControls } from '../gameObjectComponents/controls/WSADControls';
import { AnimationController } from '../gameObjectComponents/AnimationController';

export class ModelRendererTestObject extends MovableGameObject {
  private _modelRenderer: ModelRenderer | null = null;
  private _animationController: AnimationController | null = null;
  private _stateController: StateController<HUMANOID_STATES> | null = null;

  constructor(scene: TestScene) {
    super(scene, {
      speed: 3,
      sprintSpeed: 5,
      mass: 1,
      friction: 1,
      physicsBodyType: 'dynamic',
      colliderShape: RigidBody.ShapeType.Cylinder,
    });

    const monkModel = useAssetStore.getState().modelCacheGLTF.get(MODEL_MONK);
    if (!monkModel) {
      console.error(`Model not found in cache: ${MODEL_MONK}`);
      return;
    }

    this._modelRenderer = this.addComponent(
      'ModelRenderer',
      new ModelRenderer(this, { model: monkModel })
    );

    this._animationController = this.addComponent(
      'AnimationController',
      new AnimationController(this, this._modelRenderer)
    );

    this._stateController = this.addComponent(
      'StateController',
      new StateController<HUMANOID_STATES>(this, {
        initialState: HUMANOID_STATES.IDLE,
      })
    );

    // this.rigidBody.toggleVisible(true);

    if (!scene.mouseInput || !scene.keyboardInput) {
      console.error(
        'Mouse or keyboard input not available in scene. WSADControls component will not function.'
      );
      return;
    }

    this.addComponent(
      'WSADControls',
      new WSADControls({
        gameObject: this,
        camera: scene.camera,
        keyboardInput: scene.keyboardInput,
        mouseInput: scene.mouseInput,
        stateController: this._stateController,
      })
    );
  }

  public setModel(model: THREE.Object3D | null): void {
    if (!this._modelRenderer) return;
    this._modelRenderer.setModel(model);
  }
}
