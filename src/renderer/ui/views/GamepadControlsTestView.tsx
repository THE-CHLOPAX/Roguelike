import * as THREE from 'three';
import { useState } from 'react';
import { InternalLoader, useAssetStore, useGraphicsStore } from '@tgdf';

import { CHECKERBOARD_TEXTURE } from '../../constants';
import { useLoadScene } from '../../3D/hooks/useLoadScene';
import { BackToViewLayout } from '../../layouts/BackToViewLayout';
import { ThreeDViewerPixelated } from '../components/ThreeDViewerPixelated';
import { GamepadControlsTestScene } from '../../scenes/test/GamepadControlsTestScene';

export function GamepadControlsTestView() {
  const { loadTexture } = useAssetStore();
  const { resolution } = useGraphicsStore();
  const { scene, loadingProgress } = useLoadScene({
    sceneClass: GamepadControlsTestScene,
    assetsToLoad: [loadTexture(CHECKERBOARD_TEXTURE, './assets/checker.png')],
    sceneParams: {
      physics: {
        gravity: new THREE.Vector3(0, -9.81, 0),
      },
    },
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
