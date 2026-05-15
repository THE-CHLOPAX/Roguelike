import { logger } from '@tgdf';

import { Humanoid } from '../classes/gameObjects/Humanoid/Humanoid';

export const onBeforeAttack = (instance: Humanoid): void => {
  if (instance.isMoving) return;

  // Kill any existing attack timeline
  if (instance.attackTimeline) {
    instance.attackTimeline.kill();
    instance.attackTimeline = null;
  }

  if (!instance.scene) {
    logger({
      type: 'error',
      message: 'Scene is not available for attack',
    });
    return;
  }
};
