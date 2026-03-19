import { SceneConstructorOptions, useAssetStore } from '@tgdf';
import { ModelRendererTestObject } from '@3D/classes/gameObjects/ModelRendererTestObject';

import { TestScene } from './TestScene';
import { useModelTestStore } from '../../store/useModelTestStore';

export class ModelRendererTestScene extends TestScene {
  constructor(options: SceneConstructorOptions) {
    super(options);

    const modelRendererTestObject = new ModelRendererTestObject(this);

    this.add(modelRendererTestObject);

    useModelTestStore.subscribe(
      (state) => state.currentModelId,
      (currentModelId) => {
        if (!currentModelId) return;
        const gltfModels = useAssetStore.getState().modelCacheGLTF;
        const model = gltfModels.get(currentModelId);

        if (model) {
          modelRendererTestObject.setModel(model);
        }
      }
    );
  }
}
