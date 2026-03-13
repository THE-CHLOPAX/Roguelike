import { TestScene } from 'src/renderer/scenes/test/TestScene';
import { GameObject, RigidBody, Scene, useAssetStore } from '@tgdf';

import { MODEL_MONK } from '../../../constants';
import { MovableGameObject } from './MovableGameObject';
import { ModelRenderer } from '../gameObjectComponents/ModelRenderer';
import { WSADControls } from '../gameObjectComponents/controls/WSADControls';

export class ModelRendererTestObject extends MovableGameObject {
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

    this.addComponent('ModelRenderer', new ModelRenderer(this, { model: monkModel }));

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
      })
    );
  }
}
