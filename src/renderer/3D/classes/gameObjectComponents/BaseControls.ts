import * as THREE from 'three';
import { GameObjectComponent, KeyboardInput, RigidBody } from '@tgdf';

import { CAMERA_POSITION_OFFSET } from '../../constants';
import { MovableGameObject } from '../gameObjects/MovableGameObject';
import { OrtographicCameraWithControls } from '../cameras/OrtographicCameraWithControls';

export type BaseControlsOptions = {
  gameObject: MovableGameObject;
  camera: OrtographicCameraWithControls;
  cameraLerp?: number;
};

const SPRINT_MULTIPLIER = 1.75;

export class BaseControls extends GameObjectComponent {
  private _lerp = 0.025;
  private _camera: OrtographicCameraWithControls;
  private _direction = new THREE.Vector3();

  protected movableGameObject: MovableGameObject;

  constructor({ gameObject, camera, cameraLerp }: BaseControlsOptions) {
    super(gameObject);

    this._camera = camera;
    this.movableGameObject = gameObject;

    if (cameraLerp !== undefined) {
      this._lerp = cameraLerp;
    }

    this._camera.pivotPoint = this.gameObject.position;
    this._camera.toggleKeyboardControls(false); // Disable camera's own keyboard controls
  }

  protected set direction(vector: THREE.Vector3) {
    this._direction.copy(vector);
  }

  protected get direction(): THREE.Vector3 {
    return this._direction;
  }

  protected toggleSprint(enabled: boolean): void {
    if (enabled) {
      this.movableGameObject.speed *= SPRINT_MULTIPLIER;
    } else {
      this.movableGameObject.speed /= SPRINT_MULTIPLIER;
    }
  }

  protected onUpdate(_deltaTime: number): void {
    this._moveRigidBody();
    this._moveCamera();
  }

  private _moveCamera(): void {
    // Keep camera positioned above the player
    const playerPosition = new THREE.Vector3(
      this.gameObject.position.x,
      this.gameObject.position.y,
      this.gameObject.position.z
    );

    // Update pivot point to follow the player
    this._camera.pivotPoint.copy(playerPosition);

    // Rotate offset by camera's Y rotation around the pivot point
    const rotatedOffset = CAMERA_POSITION_OFFSET.clone().applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this._camera.rotation.y
    );
    // Move camera to the rotated offset position
    this._camera.moveTo(playerPosition, { offset: rotatedOffset, lerp: this._lerp });
  }

  private _moveRigidBody() {
    const moveVector = this._direction.clone();

    moveVector.normalize();

    // Apply only Y-axis rotation from camera using forward/right vectors
    const cameraForward = new THREE.Vector3();
    this._camera.getWorldDirection(cameraForward);
    cameraForward.y = 0;
    cameraForward.normalize();

    const cameraRight = new THREE.Vector3().crossVectors(cameraForward, new THREE.Vector3(0, 1, 0));

    const rotatedMove = new THREE.Vector3();
    rotatedMove.addScaledVector(cameraRight, moveVector.x);
    rotatedMove.addScaledVector(cameraForward, -moveVector.z);

    this.movableGameObject.move(rotatedMove);
  }
}
