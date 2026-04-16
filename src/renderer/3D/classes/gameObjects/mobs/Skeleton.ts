import { getModelFromStore } from '@tgdf';

import { MODELS } from '../../../constants';
import { Humanoid } from '../Humanoid/Humanoid';
import { TestScene } from '../../../../scenes/test/TestScene';

export class Skeleton extends Humanoid {
  constructor(scene: TestScene) {
    const skeletonModel = getModelFromStore(MODELS.SKELETON.id);

    if (!skeletonModel) {
      throw new Error(`Model not found in cache: ${MODELS.SKELETON.id}`);
    }

    super(scene, {
      model: skeletonModel,
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
  }
}
