import { useEffect, useState } from 'react';
import { useViewsStore, useKeyboard, useAssetStore, InternalLoader, useGraphicsStore } from '@tgdf';

import { useLoadScene } from '../3D/hooks/useLoadScene';
import { PixelPassTestScene } from '../scenes/PixelPassTestScene';
import { CHECKERBOARD_TEXTURE, TEST_TEAPOT_ASSET_ID } from '../constants';
import { ThreeDViewerPixelated } from '../3D/components/ThreeDViewerPixelated';

export function TestPixelRendererView() {
  const { goBack } = useViewsStore();
  const { resolution } = useGraphicsStore();
  const { loadModelJSON, loadTexture } = useAssetStore();

  const { scene, loadingProgress } = useLoadScene({
    sceneClass: PixelPassTestScene,
    assetsToLoad: [
      loadTexture(CHECKERBOARD_TEXTURE, './assets/checker.png'),
      loadModelJSON(TEST_TEAPOT_ASSET_ID, './assets/teapot.json', 'Utah_teapot_(solid).stl'),
    ],
  });

  const [loadingFinished, setLoadingFinished] = useState(false);

  const { addKeyDownListener } = useKeyboard();

  useEffect(() => {
    addKeyDownListener('Escape', () => {
      goBack();
    });
  }, []);

  return loadingFinished && scene ? (
    <ThreeDViewerPixelated
      scene={scene}
      camera={scene.camera}
      debug
      resX={resolution.width}
      resY={resolution.height}
    />
  ) : (
    <InternalLoader progress={loadingProgress * 100} onComplete={() => setLoadingFinished(true)} />
  );
}
