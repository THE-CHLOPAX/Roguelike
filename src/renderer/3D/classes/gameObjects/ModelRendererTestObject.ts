import * as THREE from 'three';
import { RigidBody, useAssetStore } from '@tgdf';
import { TestScene } from 'src/renderer/scenes/test/TestScene';

import { Humanoid } from './Humanoid';
import { MODEL_MONK } from '../../../constants';
import { WSADControls } from '../gameObjectComponents/controls/WSADControls';

export class ModelRendererTestObject extends Humanoid {
  constructor(scene: TestScene) {
    const monkModel = useAssetStore.getState().modelCacheGLTF.get(MODEL_MONK);

    if (!monkModel) {
      console.error(`Model not found in cache: ${MODEL_MONK}`);
      return;
    }

    super(scene, {
      model: monkModel,
      speed: 3,
      sprintSpeed: 5,
      rigidBodyOptions: {
        mass: 0.1,
        friction: 0,
        linearDamping: 0,
        lockRotation: true,
        colliderShape: RigidBody.ShapeType.Cylinder,
      },
    });

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

  public setModel(model: THREE.Object3D | null): void {
    if (!this.modelRenderer) return;
    this.modelRenderer.setModel(model);
  }
}
