import { useEffect, useState } from 'react';
import {
  useViewsStore,
  useKeyboard,
  useAssetStore,
  InternalLoader,
  ThreeDViewer
} from '@tgdf';

import { TestScene } from '../scenes/TestScene';
import { TEST_TEAPOT_ASSET_ID } from '../constants';

export function TestView() {
  const { goBack } = useViewsStore();
  const { loadModelJSON } = useAssetStore();

  const [loadingFinished, setLoadingFinished] = useState(false);
  const [scene, setScene] = useState<TestScene | null>(null);

  const { addKeyDownListener } = useKeyboard();

  // Load assets on mount
  useEffect(() => {
    Promise.all([
      loadModelJSON(TEST_TEAPOT_ASSET_ID, './assets/teapot.json', 'Utah_teapot_(solid).stl'),
    ]).then(() => {
      setScene(new TestScene());
    });

    addKeyDownListener('Escape', () => {
      goBack();
    });
  }, []);

  return (
    loadingFinished && scene ?
      <ThreeDViewer scene={scene} camera={scene.camera} debug />
      : <InternalLoader progress={scene ? 100 : 0} onComplete={() => setLoadingFinished(true)} />
  );
}
