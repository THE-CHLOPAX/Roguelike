import { Button } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { useViewsStore, useKeyboard, useAssetStore, InternalLoader, useGraphicsStore } from '@tgdf';

import { useLoadScene } from '../3D/hooks/useLoadScene';
import { PixelPassTestScene } from '../scenes/PixelPassTestScene';
import { CHECKERBOARD_TEXTURE, TEST_TEAPOT_ASSET_ID } from '../constants';
import { ThreeDViewerPixelated } from '../3D/components/ThreeDViewerPixelated';

export function TestPixelRendererView() {
  const { goBack } = useViewsStore();
  const { resolution, antialiasing, setAntialiasing } = useGraphicsStore();
  const { loadModelJSON, loadTexture } = useAssetStore();

  const [paused, setPaused] = useState(false);

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
    <>
      <Button
        onClick={() => setPaused(!paused)}
        style={{ position: 'absolute', top: 10, left: 10, zIndex: 1 }}
      >
        {paused ? 'Resume' : 'Pause'}
      </Button>
      <Button
        onClick={() => setAntialiasing(!antialiasing)}
        style={{ position: 'absolute', top: 50, left: 10, zIndex: 1 }}
      >
        {antialiasing ? 'Antialiasing: On' : 'Antialiasing: Off'}
      </Button>
      <ThreeDViewerPixelated
        scene={scene}
        camera={scene.camera}
        debug
        resX={resolution.width}
        resY={resolution.height}
        isPaused={paused}
      />
    </>
  ) : (
    <InternalLoader progress={loadingProgress * 100} onComplete={() => setLoadingFinished(true)} />
  );
}
