import { Scene } from '@tgdf';

import { EntityMovable, EntityMovableOptions } from '../EntityMovable';

export type HumanoidOptions = EntityMovableOptions;

export class Humanoid extends EntityMovable {
  constructor(scene: Scene, options: HumanoidOptions) {
    super(scene, options);
  }
}
