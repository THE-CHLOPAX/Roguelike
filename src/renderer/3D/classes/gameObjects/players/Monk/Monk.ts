import { config } from './config';
import { Player } from '../Player';
import { GameScene } from '../../../scenes/GameScene';

export class Monk extends Player {
  constructor(scene: GameScene) {
    super(scene, config);
  }
}
