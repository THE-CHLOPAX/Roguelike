import { Player } from '../Player';
import { IdleState } from './states/IdleState';
import { TestScene } from '../../../scenes/TestScene';
import { DEFAULT_RIGID_BODY_OPTIONS, MODELS } from '../../../../constants';

export class Monk extends Player {
  constructor(scene: TestScene) {
    super(scene, {
      model: {
        id: MODELS.MONK.id,
      },
      speed: 2.5,
      sprintSpeed: 4,
      walkSpeed: 1,
      rigidBodyOptions: { ...DEFAULT_RIGID_BODY_OPTIONS },
    });

    this.stateController.currentState = new IdleState(this);
  }
}
