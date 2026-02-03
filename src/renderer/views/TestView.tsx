import { Button } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import {
  useViewsStore,
  useKeyboard,
  useAssetStore,
  InternalLoader,
  ThreeDViewer,
  useGraphicsStore,
} from '@tgdf';

import { TestScene } from '../scenes/TestScene';
import { TEST_TEAPOT_ASSET_ID } from '../constants';
import { useLoadScene } from '../3D/hooks/useLoadScene';

export function TestView() {
  const { goBack } = useViewsStore();
  const { loadModelJSON } = useAssetStore();

  const [paused, setPaused] = useState(false);
  const { antialiasing, setAntialiasing } = useGraphicsStore();

  const { scene, loadingProgress } = useLoadScene({
    sceneClass: TestScene,
    assetsToLoad: [
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
      <ThreeDViewer scene={scene} camera={scene.camera} isPaused={paused} debug />
    </>
  ) : (
    <InternalLoader progress={loadingProgress * 100} onComplete={() => setLoadingFinished(true)} />
  );
}
