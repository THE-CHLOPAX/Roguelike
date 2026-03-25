import { logger, RigidBody, useAssetStore } from '@tgdf';

import { Humanoid } from '../Humanoid/Humanoid';
import { MODEL_MONK } from '../../../../constants';
import { TestScene } from '../../../../scenes/test/TestScene';
import { WSADControls } from '../../gameObjectComponents/controls/WSADControls';

export class Monk extends Humanoid {
  constructor(scene: TestScene) {
    const monkModel = useAssetStore.getState().modelCacheGLTF.get(MODEL_MONK);

    if (!monkModel) {
      logger({ message: `Model not found in cache: ${MODEL_MONK}`, type: 'error' });
      return;
    }

    super(scene, {
      model: monkModel,
      speed: 2.5,
      sprintSpeed: 4,
      rigidBodyOptions: {
        mass: 0.1,
        friction: 0,
        linearDamping: 0,
        lockRotation: true,
        colliderShape: RigidBody.ShapeType.Cylinder,
      },
    });

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
