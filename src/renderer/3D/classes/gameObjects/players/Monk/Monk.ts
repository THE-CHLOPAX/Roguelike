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
      animationControllerOptions: {
        playbackRates: {
          spawn: 2,
          kick: 1.5,
          hit: 1.8,
          run: 0.9,
        },
      },
      healthOptions: {
        initialHealthPoints: 10,
      },
    });

    this.stateController.currentState = new IdleState(this);
  }
}
