import { ModelRendererTestObject } from '@3D/classes/gameObjects/ModelRendererTestObject';

import { TestScene } from './TestScene';

export class ModelRendererTestScene extends TestScene {
  constructor() {
    super();

    const modelRendererTestObject = new ModelRendererTestObject(this);

    this.add(modelRendererTestObject);
  }
}
