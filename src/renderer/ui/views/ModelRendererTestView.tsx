import { useState } from 'react';
import { InternalLoader, useAssetStore, useGraphicsStore } from '@tgdf';

import { useLoadScene } from '../../3D/hooks/useLoadScene';
import { BackToViewLayout } from '../../layouts/BackToViewLayout';
import { CHECKERBOARD_TEXTURE, MODEL_MONK } from '../../constants';
import { ThreeDViewerPixelated } from '../components/ThreeDViewerPixelated';
import { ModelRendererTestScene } from '../../scenes/test/ModelRendererTestScene';

export function ModelRendererTestView() {
  const { loadTexture, loadModelGLTF } = useAssetStore();
  const { resolution } = useGraphicsStore();
  const { scene, loadingProgress } = useLoadScene({
    sceneClass: ModelRendererTestScene,
    assetsToLoad: [
      loadTexture(CHECKERBOARD_TEXTURE, './assets/checker.png'),
      loadModelGLTF(MODEL_MONK, './assets/monk.glb'),
    ],
  });
  const [loadingFinished, setLoadingFinished] = useState(false);

  return (
    <BackToViewLayout backToView="menu">
      {!loadingFinished ? (
        <InternalLoader
          progress={loadingProgress * 100}
          onComplete={() => setLoadingFinished(true)}
        />
      ) : (
        <ThreeDViewerPixelated
          scene={scene!}
          resX={resolution.width}
          resY={resolution.height}
          debug
        />
      )}
    </BackToViewLayout>
  );
}
