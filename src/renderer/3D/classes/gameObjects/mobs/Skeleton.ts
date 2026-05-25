import { getModelFromStore } from '@tgdf';

import { MODELS } from '../../../constants';
import { EntityMovable } from '../EntityMovable';
import { TestScene } from '../../../../scenes/test/TestScene';

export class Skeleton extends EntityMovable {
  constructor(scene: TestScene) {
    const skeletonModel = getModelFromStore(MODELS.SKELETON.id);

    if (!skeletonModel) {
      throw new Error(`Model not found in cache: ${MODELS.SKELETON.id}`);
    }

    skeletonModel.scale.multiplyScalar(1.2);

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
        colliderShape: 'box',
        enableCollisionDetection: true,
      },
    });
  }
}
