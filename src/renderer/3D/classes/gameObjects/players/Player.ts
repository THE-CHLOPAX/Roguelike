import { EntityOptions } from '../Entity';
import { Humanoid } from '../Humanoid/Humanoid';
import { TestScene } from '../../../../scenes/test/TestScene';
import { DamageHitboxController } from '../../gameObjectComponents/DamageHitboxController';

export class Player extends Humanoid {
  public damageHitboxController: DamageHitboxController;

  constructor(scene: TestScene, options: EntityOptions) {
    super(scene, options);

    this.damageHitboxController = this.addComponent(
      'DamageHitboxController',
      new DamageHitboxController(this, this.modelRenderer)
    );
  }
}
