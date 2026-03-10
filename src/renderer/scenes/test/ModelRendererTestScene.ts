import { SceneConstructorOptions } from '@tgdf';
import { ControlledBox } from '@3D/classes/gameObjects/ControlledBox';
import { ModelRendererTestObject } from '@3D/classes/gameObjects/ModelRendererTestObject';

import { TestScene } from './TestScene';

export class ModelRendererTestScene extends TestScene {
  constructor(options: SceneConstructorOptions) {
    super(options);

    const modelRendererTestObject = new ModelRendererTestObject(this);

    this.add(modelRendererTestObject);
  }
}
