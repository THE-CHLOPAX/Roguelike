import { AttackAction } from 'src/renderer/3D/types';

import { Entity } from '../../Entity';

export const attack: AttackAction = async (entity: Entity) => {
  return new Promise<void>((resolve) => {
    entity.animationController.playAnimation('attack-1', {
      loop: false,
      clampWhenFinished: true,
      onComplete: () => {
        resolve();
      },
    });
  });
};
