import { useState } from 'react';
import { init as initializeRecastNavigation } from 'recast-navigation';
import { InternalLoader, useAssetStore, useGraphicsStore } from '@tgdf';

import { useLoadScene } from '../../3D/hooks/useLoadScene';
import { BackToViewLayout } from '../../layouts/BackToViewLayout';
import { ThreeDViewerPixelated } from '../components/ThreeDViewerPixelated';
import { PathfindingTestScene } from '../../scenes/test/PathfindingTestScene';
import { CHECKERBOARD_TEXTURE, MODEL_KNIGHT, MODEL_MONK } from '../../constants';

export function PathfindingTestView() {
  const { loadTexture, loadModelGLTF } = useAssetStore();
  const { resolution } = useGraphicsStore();
  const { scene, loadingProgress } = useLoadScene({
    sceneClass: PathfindingTestScene,
    asyncPreloadOperations: [
      loadTexture(CHECKERBOARD_TEXTURE, './assets/checker.png'),
      loadModelGLTF(MODEL_MONK, './assets/playerModels/monk.glb', 'Monk'),
      loadModelGLTF(MODEL_KNIGHT, './assets/playerModels/knight.glb', 'Knight'),
      initializeRecastNavigation(),
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
