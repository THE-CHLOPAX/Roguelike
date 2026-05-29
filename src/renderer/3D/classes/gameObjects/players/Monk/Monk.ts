import * as THREE from 'three';

import { Player } from '../Player';
import { MODELS } from '../../../../constants';
import { IdleState } from './states/IdleState';
import { TestScene } from '../../../scenes/TestScene';

export class Monk extends Player {
  constructor(scene: TestScene) {
    super(scene, {
      model: {
        id: MODELS.MONK.id,
        scale: new THREE.Vector3(1, 1, 1),
      },
      speed: 2.5,
      sprintSpeed: 4,
      walkSpeed: 1,
      rigidBodyOptions: {
        mass: 0.1,
        friction: 0,
        linearDamping: 0,
        lockRotation: true,
        colliderShape: 'cylinder',
      },
    });

    this.stateController.currentState = new IdleState(this);
  }
}
