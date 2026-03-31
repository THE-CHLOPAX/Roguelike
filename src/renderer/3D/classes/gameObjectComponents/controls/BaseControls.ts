import * as THREE from 'three';
import { GameObjectComponent } from '@tgdf';

import { CAMERA_POSITION_OFFSET } from '../../../constants';
import { Humanoid } from '../../gameObjects/Humanoid/Humanoid';
import { OrtographicCamera } from '../../cameras/OrtographicCamera';

export type BaseControlsOptions = {
  gameObject: Humanoid;
  camera: OrtographicCamera;
  cameraLerp?: number;
};

/**
 * BaseControls class for handling common control logic like body movement,
 * camera movement and sprint toggling. Specific input handling (keyboard, gamepad, etc.)
 * should be implemented in its subclasses.
 */
export class BaseControls extends GameObjectComponent {
  private _lerp = 0.025;
  private _hasStopped = false;

  protected direction = new THREE.Vector3();
  protected camera: OrtographicCamera;

  protected static ROTATION_SENSITIVITY = 0.002;
  protected static ZOOM_SENSITIVITY = 0.001;

  constructor({ gameObject, camera, cameraLerp }: BaseControlsOptions) {
    super(gameObject);

    this.camera = camera;

    if (cameraLerp !== undefined) {
      this._lerp = cameraLerp;
    }

    this.camera.pivotPoint = this.gameObject.position;
  }

  public override get gameObject(): Humanoid {
    return super.gameObject as Humanoid;
  }

  protected onUpdate(_deltaTime: number): void {
    this._moveRigidBody();
    this._moveCamera();
  }

  private _moveCamera(): void {
    // Keep camera positioned above the player
    const playerPosition = this.gameObject.position.clone();

    // Update pivot point to follow the player
    this.camera.pivotPoint.copy(playerPosition);

    // Rotate offset by camera's Y rotation around the pivot point
    const rotatedOffset = CAMERA_POSITION_OFFSET.clone().applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.camera.rotation.y
    );

    console.log(
      'mocing camera to player position: ',
      playerPosition,
      ' with offset: ',
      rotatedOffset
    );

    // Move camera to the rotated offset position
    this.camera.moveTo(playerPosition, { offset: rotatedOffset, lerp: this._lerp });
  }

  private _moveRigidBody() {
    const moveVector = this.direction.clone();

    moveVector.normalize();

    // Apply only Y-axis rotation from camera using forward/right vectors
    const cameraForward = new THREE.Vector3();
    this.camera.getWorldDirection(cameraForward);
    cameraForward.y = 0;
    cameraForward.normalize();

    const cameraRight = new THREE.Vector3().crossVectors(cameraForward, new THREE.Vector3(0, 1, 0));

    const rotatedMove = new THREE.Vector3();
    rotatedMove.addScaledVector(cameraRight, moveVector.x);
    rotatedMove.addScaledVector(cameraForward, -moveVector.z);

    const isMoving = rotatedMove.lengthSq() > 0;

    if (isMoving) {
      this.gameObject.move(rotatedMove);
      this._hasStopped = false;
    } else if (!this._hasStopped) {
      this.gameObject.move(rotatedMove);
      this._hasStopped = true;
    }
  }
}
