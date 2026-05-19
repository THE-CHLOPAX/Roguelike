import { Scene } from '@tgdf';

import { Humanoid, HumanoidOptions } from '../Humanoid/Humanoid';
import { KeyboardControls } from '../../gameObjectComponents/KeyboardControls';

export class Player extends Humanoid {
  private _controls: KeyboardControls;

  constructor(scene: Scene, options: HumanoidOptions) {
    super(scene, options);

    this._controls = this.addComponent('KeyboardControls', new KeyboardControls(this));
  }
}
