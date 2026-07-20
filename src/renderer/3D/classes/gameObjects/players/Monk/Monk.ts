import { config } from './config';
import { Player } from '../Player';
import { TestScene } from '../../../scenes/TestScene';
import { IdleState } from '../../../states/Player/IdleState';

export class Monk extends Player {
  constructor(scene: TestScene) {
    super(scene, config);

    this.stateController.currentState = new IdleState(this);
  }
}
