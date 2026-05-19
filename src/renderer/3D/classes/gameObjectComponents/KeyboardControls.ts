import * as THREE from 'three';
import { GameObjectComponent, Input, logger } from '@tgdf';

import { EntityMovable } from '../gameObjects/EntityMovable';

export class KeyboardControls extends GameObjectComponent {
  constructor(gameObject: EntityMovable) {
    super(gameObject);
  }

  public override get gameObject(): EntityMovable {
    return super.gameObject as EntityMovable;
  }

  protected override onUpdate(_deltaTime: number): void {
    const direction = new THREE.Vector3();

    if (Input.keyboard.isKeyPressed('w')) {
      direction.z = -1;
    }

    if (Input.keyboard.isKeyPressed('s')) {
      direction.z = 1;
    }

    if (Input.keyboard.isKeyPressed('a')) {
      direction.x = -1;
    }

    if (Input.keyboard.isKeyPressed('d')) {
      direction.x = 1;
    }

    this.gameObject.toggleSprint(Input.keyboard.isKeyPressed('shift'));

    const moveVector = direction.clone();

    moveVector.normalize();

    // Apply only Y-axis rotation from camera using forward/right vectors
    const cameraForward = new THREE.Vector3();

    if (!this.gameObject.scene || !this.gameObject.scene.camera) {
      logger({
        message: 'KeyboardControls: No camera found in the scene.',
        type: 'error',
      });
      return;
    }

    this.gameObject.scene.camera.getWorldDirection(cameraForward);
    cameraForward.y = 0;
    cameraForward.normalize();

    const cameraRight = new THREE.Vector3().crossVectors(cameraForward, new THREE.Vector3(0, 1, 0));

    const rotatedMove = new THREE.Vector3();
    rotatedMove.addScaledVector(cameraRight, moveVector.x);
    rotatedMove.addScaledVector(cameraForward, -moveVector.z);

    this.gameObject.move(rotatedMove);
  }
}
