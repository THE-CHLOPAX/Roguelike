import { getModelFromStore } from '@tgdf';

import { kick } from './attacks';
import { Player } from '../Player';
import { Hitbox } from '../../Hitbox';
import { MODELS } from '../../../../constants';
import { TestScene } from '../../../../../scenes/test/TestScene';
import { WSADControls } from '../../../gameObjectComponents/controls/WSADControls';

export class Monk extends Player {
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

  public override attack(variant: '1' | '2' | '3' | '4'): boolean {
    if (!super.attack(variant)) return false;

    switch (variant) {
      // Kick
      case '1':
        kick(this);
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
    return true;
  }
}
