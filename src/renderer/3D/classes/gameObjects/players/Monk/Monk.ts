import { Scene } from '@tgdf';

import { config } from './config';
import { Player } from '../Player';

export class Monk extends Player {
  constructor(scene: Scene) {
    super(scene, config);
  }
}
