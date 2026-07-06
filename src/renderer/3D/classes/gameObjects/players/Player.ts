import { Scene } from '@tgdf';

import { Entity, EntityOptions } from '../Entity';

export class Player extends Entity {
  constructor(scene: Scene, options: EntityOptions) {
    super(scene, options);
  }
}
