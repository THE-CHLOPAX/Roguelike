import { useEffect, useState } from 'react';
import { useViewsStore, useKeyboard, useAssetStore, InternalLoader, ThreeDViewer } from '@tgdf';

import { TestScene } from '../scenes/TestScene';
import { TEST_TEAPOT_ASSET_ID } from '../constants';
import { useLoadScene } from '../3D/hooks/useLoadScene';

export function TestView() {
  const { goBack } = useViewsStore();
  const { loadModelJSON } = useAssetStore();

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
    <ThreeDViewer scene={scene} camera={scene.camera} debug />
  ) : (
    <InternalLoader progress={loadingProgress * 100} onComplete={() => setLoadingFinished(true)} />
  );
}
