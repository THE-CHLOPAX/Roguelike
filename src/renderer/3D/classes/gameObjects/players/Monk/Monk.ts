import { config } from './config';
import { Player } from '../Player';
import { TestScene } from '../../../scenes/TestScene';

export class Monk extends Player {
  constructor(scene: TestScene) {
    super(scene, config);
  }
}
