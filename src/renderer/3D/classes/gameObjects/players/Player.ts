import { Scene } from '@tgdf';

import { EntityMovable, EntityMovableOptions } from '../EntityMovable';

export class Player extends EntityMovable {
  constructor(scene: Scene, options: EntityMovableOptions) {
    super(scene, options);
  }
}
