import * as THREE from 'three';
import { useEffect, useState } from 'react';
import { InternalLoader, useAssetStore, useGraphicsStore, useKeyboard, useViewsStore } from '@tgdf';

import { CHECKERBOARD_TEXTURE } from '../constants';
import { useLoadScene } from '../3D/hooks/useLoadScene';
import { ControlsTestScene } from '../scenes/ControlsTestScene';
import { ThreeDViewerPixelated } from '../3D/components/ThreeDViewerPixelated';

export function ControlsTestView() {
  const { goBack } = useViewsStore();
  const { loadTexture } = useAssetStore();
  const { resolution } = useGraphicsStore();
  const { addKeyDownListener } = useKeyboard();
  const { scene, loadingProgress } = useLoadScene({
    sceneClass: ControlsTestScene,
    assetsToLoad: [loadTexture(CHECKERBOARD_TEXTURE, './assets/checker.png')],
    sceneParams: {
      physics: {
        gravity: new THREE.Vector3(0, -9.81, 0),
      },
    },
  });
  const [loadingFinished, setLoadingFinished] = useState(false);

  useEffect(() => {
    addKeyDownListener('Escape', () => {
      goBack();
    });
  }, []);

  return !loadingFinished ? (
    <InternalLoader progress={loadingProgress * 100} onComplete={() => setLoadingFinished(true)} />
  ) : (
    <ThreeDViewerPixelated scene={scene!} resX={resolution.width} resY={resolution.height} debug />
  );
}
