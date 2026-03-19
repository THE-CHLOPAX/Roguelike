import { SceneConstructorOptions } from '@tgdf';

import { TestScene } from './TestScene';
import { ControlledBox } from '../../3D/classes/gameObjects/ControlledBox';

export class WSADControlsTestScene extends TestScene {
  constructor(options: SceneConstructorOptions) {
    super(options);

    // Add test cube rigid body
    const controlledBox = new ControlledBox(this);
    controlledBox.position.set(0, 1, 0);
    this.add(controlledBox);
  }
}
