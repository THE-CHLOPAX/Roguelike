import { useState } from 'react';
import { InternalLoader, ThreeDViewer, useAssetStore, useGraphicsStore } from '@tgdf';

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
      loadModelGLTF(MODELS.MONK.id, MODELS.MONK.path, MODELS.MONK.nameExtractor),
      loadModelGLTF(MODELS.SKELETON.id, MODELS.SKELETON.path, MODELS.SKELETON.nameExtractor),
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
        <ThreeDViewer scene={scene!} resX={resolution.width} resY={resolution.height} debug />
      )}
    </BackToViewLayout>
  );
}
