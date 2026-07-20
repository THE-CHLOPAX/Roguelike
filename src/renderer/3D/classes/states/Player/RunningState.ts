import * as THREE from 'three';
import { Input, InputState, logger } from '@tgdf';

import { AnimationClipNamesShared } from '../../../types';
import { Player } from '../../gameObjects/players/Player';
import { mapInputToControls } from '../../../utils/mapInputToControls';
import { State, StateWithHealthEvents, SprintingState, IdleState } from '..';

export class RunningState extends StateWithHealthEvents {
  constructor(public entity: Player) {
    super(entity);
  }

  public override onEnter(): void {
    this.entity.animationController.playAnimation(AnimationClipNamesShared.RUN, { loop: true });
  }

  public override onExit(): void {}

  public override onInput(inputState: InputState): State {
    const controlsState = mapInputToControls(inputState);

    if (controlsState.type === 'sprint') {
      return new SprintingState(this.entity);
    }

    if (controlsState.type === 'idle') {
      return new IdleState(this.entity);
    }

    return this;
  }

  public override onUpdate(_deltaTime: number): State {
    const controlState = mapInputToControls(Input.getState());
    if (controlState === null || !('direction' in controlState)) return this;

    this._moveEntity(controlState.direction);
    return this;
  }

  private _moveEntity(direction: THREE.Vector3): void {
    const moveVector = direction.clone();

    moveVector.normalize();

    // Apply only Y-axis rotation from camera using forward/right vectors
    const cameraForward = new THREE.Vector3();

    if (!this.entity.scene || !this.entity.scene.camera) {
      logger({
        message: 'KeyboardControls: No camera found in the scene.',
        type: 'error',
      });
      return;
    }

    this.entity.scene.camera.getWorldDirection(cameraForward);
    cameraForward.y = 0;
    cameraForward.normalize();

    const cameraRight = new THREE.Vector3().crossVectors(cameraForward, new THREE.Vector3(0, 1, 0));

    const rotatedMove = new THREE.Vector3();
    rotatedMove.addScaledVector(cameraRight, moveVector.x);
    rotatedMove.addScaledVector(cameraForward, -moveVector.z);

    this.entity.movementController.move(rotatedMove);
  }

  protected override recreateInstance(): RunningState {
    return new RunningState(this.entity);
  }
}
