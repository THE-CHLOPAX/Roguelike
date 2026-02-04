import { Button } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import {
  useViewsStore,
  useKeyboard,
  useAssetStore,
  InternalLoader,
  useGraphicsStore,
  AVAILABLE_RESOLUTIONS,
  InternalSelect,
} from '@tgdf';

import { useLoadScene } from '../3D/hooks/useLoadScene';
import { PixelPassTestScene } from '../scenes/PixelPassTestScene';
import { CHECKERBOARD_TEXTURE, TEST_TEAPOT_ASSET_ID } from '../constants';
import { ThreeDViewerPixelated } from '../3D/components/ThreeDViewerPixelated';

export function TestPixelRendererView() {
  const { goBack } = useViewsStore();
  const { resolution, antialiasing, setAntialiasing, fullscreen, setFullscreen, setResolution } =
    useGraphicsStore();
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
        style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 1 }}
      >
        {paused ? 'Resume' : 'Pause'}
      </Button>
      <Button
        onClick={() => setAntialiasing(!antialiasing)}
        style={{ position: 'absolute', bottom: 50, left: 10, zIndex: 1 }}
      >
        {antialiasing ? 'Antialiasing: On' : 'Antialiasing: Off'}
      </Button>
      <Button
        onClick={() => setFullscreen(!fullscreen)}
        style={{ position: 'absolute', bottom: 90, left: 10, zIndex: 1 }}
      >
        {fullscreen ? 'Windowed Mode' : 'Fullscreen Mode'}
      </Button>

      <div style={{ position: 'absolute', bottom: 130, left: 10, zIndex: 1 }}>
        <InternalSelect
          options={AVAILABLE_RESOLUTIONS.map((res) => ({
            value: res,
            label: `${res.width} x ${res.height}`,
          }))}
          value={resolution}
          onChange={(value) => {
            setResolution(value);
          }}
        />
      </div>
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
