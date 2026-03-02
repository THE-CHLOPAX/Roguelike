import * as THREE from 'three';
import { GameObjectComponent, KeyboardInput, RigidBody } from '@tgdf';

import { CAMERA_POSITION_OFFSET } from '../../constants';
import { MovableGameObject } from '../gameObjects/MovableGameObject';
import { OrtographicCameraWithControls } from '../cameras/OrtographicCameraWithControls';

export type WSADControlsOptions = {
  gameObject: MovableGameObject;
  camera: OrtographicCameraWithControls;
  keyboardInput: KeyboardInput;
  cameraLerp?: number;
};

const SPRINT_MULTIPLIER = 1.75;

export class WSADControls extends GameObjectComponent {
  private _lerp = 0.025;
  private _movableGameObject: MovableGameObject;
  private _camera: OrtographicCameraWithControls;
  private _keyboardInput: KeyboardInput;
  private _direction = new THREE.Vector3();

  constructor({ gameObject, camera, keyboardInput, cameraLerp }: WSADControlsOptions) {
    super(gameObject);

    this._camera = camera;
    this._keyboardInput = keyboardInput;
    this._movableGameObject = gameObject;

    if (cameraLerp !== undefined) {
      this._lerp = cameraLerp;
    }

    this._camera.pivotPoint = this.gameObject.position;
    this._camera.toggleKeyboardControls(false); // Disable camera's own keyboard controls

    this._handleKeyboardInput();
  }

  protected onUpdate(_deltaTime: number): void {
    this._moveRigidBody();
    this._moveCamera();
  }

  private _handleKeyboardInput(): void {
    const keyMappings = [
      { key: 'w', axis: 'z' as const, value: -1 },
      { key: 'a', axis: 'x' as const, value: -1 },
      { key: 's', axis: 'z' as const, value: 1 },
      { key: 'd', axis: 'x' as const, value: 1 },
    ];

    this._keyboardInput.addKeyDownListener('shift', () => {
      const defaultSpeed = this._movableGameObject.speed;
      const sprintSpeed = defaultSpeed * SPRINT_MULTIPLIER;
      this._movableGameObject.speed = sprintSpeed;
    });

    this._keyboardInput.addKeyUpListener('shift', () => {
      this._movableGameObject.speed /= SPRINT_MULTIPLIER;
    });

    for (const { key, axis, value } of keyMappings) {
      this._keyboardInput.addKeyPressListener(
        key,
        () => {
          this._direction[axis] = value;
        },
        10
      );
      this._keyboardInput.addKeyUpListener(key, () => {
        this._direction[axis] = 0;
      });
    }
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

    this._movableGameObject.move(rotatedMove);
  }
}
