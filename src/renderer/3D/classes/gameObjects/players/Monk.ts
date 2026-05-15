import { getModelFromStore } from '@tgdf';

import { MODELS } from '../../../constants';
import { Humanoid } from '../Humanoid/Humanoid';
import { TestScene } from '../../../../scenes/test/TestScene';
import { WSADControls } from '../../gameObjectComponents/controls/WSADControls';

export class Monk extends Humanoid {
  constructor(scene: TestScene) {
    const monkModel = getModelFromStore(MODELS.MONK.id);

    if (!monkModel) {
      throw new Error(`Model not found in cache: ${MODELS.MONK.id}`);
    }

    super(scene, {
      model: monkModel,
      speed: 2.5,
      sprintSpeed: 4,
      walkSpeed: 1,
      rigidBodyOptions: {
        mass: 0.1,
        friction: 0,
        linearDamping: 0,
        lockRotation: true,
        colliderShape: 'box',
      },
    });

    this.addComponent(
      'WSADControls',
      new WSADControls({
        gameObject: this,
        camera: scene.camera,
      })
    );
  }
}
