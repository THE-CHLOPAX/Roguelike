import { useState } from 'react';
import { InternalLoader, useAssetStore, useGraphicsStore } from '@tgdf';

import { CHECKERBOARD_TEXTURE } from '../../3D/constants';
import { useLoadScene } from '../../3D/hooks/useLoadScene';
import { TestScene } from '../../3D/classes/scenes/TestScene';
import { BackToViewLayout } from '../layouts/BackToViewLayout';
import { ARCANE_CIRCLE_TEXTURE, MODELS } from '../../3D/constants';
import { ThreeDViewerPixelated } from '../components/ThreeDViewerPixelated';

export function TestView() {
  const { loadTexture, loadModelGLTF } = useAssetStore();
  const { resolution } = useGraphicsStore();
  const { scene, loadingProgress } = useLoadScene({
    sceneClass: TestScene,
    asyncPreloadOperations: [
      loadTexture(CHECKERBOARD_TEXTURE, './assets/checker.png'),
      loadTexture(ARCANE_CIRCLE_TEXTURE, './assets/arcane-circle.png'),
      loadModelGLTF(MODELS.MONK.id, MODELS.MONK.path, {
        nameExtractor: MODELS.MONK.nameExtractor,
        centerOrigin: true,
      }),
      loadModelGLTF(MODELS.SKELETON.id, MODELS.SKELETON.path, {
        nameExtractor: MODELS.SKELETON.nameExtractor,
        centerOrigin: true,
      }),
    ],
  });

  const [loadingFinished, setLoadingFinished] = useState(false);

  return (
    <BackToViewLayout backToView="MenuView">
      {!loadingFinished || scene === null ? (
        <InternalLoader
          progress={loadingProgress * 100}
          onComplete={() => setLoadingFinished(true)}
        />
      ) : (
        <ThreeDViewerPixelated
          scene={scene}
          resX={resolution.width}
          resY={resolution.height}
          debug
        />
      )}
    </BackToViewLayout>
  );
}
