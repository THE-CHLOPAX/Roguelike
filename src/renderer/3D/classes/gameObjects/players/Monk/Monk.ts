import { getModelFromStore } from '@tgdf';

import { Player } from '../Player';
import { MODELS } from '../../../../constants';
import { IdleState } from './states/IdleState';
import { TestScene } from '../../../../../scenes/test/TestScene';

export class Monk extends Player {
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
        colliderShape: 'cylinder',
      },
    });

    this.stateController.currentState = new IdleState(this);
  }
}
