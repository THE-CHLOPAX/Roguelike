import { useState } from 'react';
import { InternalLoader, useAssetStore, useGraphicsStore } from '@tgdf';

import { MODELS } from '../../3D/constants';
import { CHECKERBOARD_TEXTURE } from '../../constants';
import { useLoadScene } from '../../3D/hooks/useLoadScene';
import { BackToViewLayout } from '../../layouts/BackToViewLayout';
import { ThreeDViewerPixelated } from '../components/ThreeDViewerPixelated';
import { PathfindingTestScene } from '../../scenes/test/PathfindingTestScene';

export function PathfindingTestView() {
  const { loadTexture, loadModelGLTF } = useAssetStore();
  const { resolution } = useGraphicsStore();
  const { scene, loadingProgress } = useLoadScene({
    sceneClass: PathfindingTestScene,
    asyncPreloadOperations: [
      loadTexture(CHECKERBOARD_TEXTURE, './assets/checker.png'),
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
