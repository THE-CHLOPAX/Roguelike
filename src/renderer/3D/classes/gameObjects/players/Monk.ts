import * as THREE from 'three';
import { getModelFromStore, logger } from '@tgdf';

import { Hitbox } from '../Hitbox';
import { MODELS } from '../../../constants';
import { DamageHitbox } from '../DamageHitbox';
import { Humanoid } from '../Humanoid/Humanoid';
import { HumanoidStates } from '../../../../3D/types';
import { TestScene } from '../../../../scenes/test/TestScene';
import { WSADControls } from '../../gameObjectComponents/controls/WSADControls';

export class Monk extends Humanoid {
  private _attackHitbox: Hitbox | null = null;

  constructor(scene: TestScene) {
    const monkModel = getModelFromStore(MODELS.MONK.id);

    if (!monkModel) {
      throw new Error(`Model not found in cache: ${MODELS.MONK.id}`);
    }

    super(scene, {
      model: monkModel,
      speed: 2.5,
      sprintSpeed: 4,
      walkSpeed: 1,
      rigidBodyOptions: {
        mass: 0.1,
        friction: 0,
        linearDamping: 0,
        lockRotation: true,
        colliderShape: 'box',
        enableCollisionDetection: true,
      },
    });

    this.addComponent(
      'WSADControls',
      new WSADControls({
        gameObject: this,
        camera: scene.camera,
        keyboardInput: scene.keyboardInput,
        mouseInput: scene.mouseInput,
      })
    );
  }

  public override attack(variant: '1' | '2' | '3' | '4'): void {
    this.stateController.setState(HumanoidStates[`ATTACKING_${variant}`]);

    switch (variant) {
      // Kick
      case '1':
        this._kick();
        break;
      // Punch
      case '2':
        // Implement punch logic here
        break;
      // Special Attack 1
      case '3':
        // Implement special attack 1 logic here
        break;
      // Special Attack 2
      case '4':
        // Implement special attack 2 logic here
        break;
    }
  }

  private _kick(): void {
    if (this._attackHitbox) {
      this.modelRenderer.removeAttachment(this._attackHitbox);
      this._attackHitbox = null;
    }

    if (!this.scene) {
      logger({
        type: 'error',
        message: 'Scene is not available for Monk attack',
      });
      return;
    }

    this._attackHitbox = new DamageHitbox(this.scene, new THREE.Vector3(0.3, 0.3, 0.3), this, 10);
    this.scene.add(this._attackHitbox);

    this._attackHitbox.toggleDebug(true);

    this.modelRenderer.addAttachment({
      object: this._attackHitbox,
      parentName: 'Ctrl_Foot_IK_Right',
    });

    this.animationController.playAnimation(HumanoidStates.ATTACKING_1, {
      clampWhenFinished: true,
      onComplete: () => {
        if (this._attackHitbox) {
          this.modelRenderer.removeAttachment(this._attackHitbox);
          this._attackHitbox = null;
        }
        this.stateController.setState(HumanoidStates.IDLE);
      },
    });
  }
}
