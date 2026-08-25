import * as THREE from 'three';
import { useState } from 'react';
import { useAssetStore, useGraphicsStore } from '@tgdf';

import { LoadingView } from './LoadingView';
import { CHECKERBOARD_TEXTURE } from '../../3D/constants';
import { useLoadScene } from '../../3D/hooks/useLoadScene';
import { TestScene } from '../../3D/classes/scenes/TestScene';
import { BackToViewLayout } from '../layouts/BackToViewLayout';
import { ThreeDViewerPixelated } from '../components/ThreeDViewerPixelated';
import { EXPLOSION_SPRITESHEET_TEXTURE, ARCANE_CIRCLE_TEXTURE, MODELS } from '../../3D/constants';

export function TestView() {
  const { resolution } = useGraphicsStore();
  const { scene, loadingProgress } = useLoadScene({
    sceneClass: TestScene,
    sceneBuilder: async () => {
      const { loadTexture } = useAssetStore.getState();
      await Promise.all([
        loadTexture(CHECKERBOARD_TEXTURE, './assets/checker.png'),
        loadTexture(EXPLOSION_SPRITESHEET_TEXTURE, './assets/explosion.png', THREE.SRGBColorSpace),
        loadTexture(ARCANE_CIRCLE_TEXTURE, './assets/arcane-circle.png'),
      ]);
    },
    characterModels: [MODELS.MONK, MODELS.SKELETON],
  });

  const [loadingFinished, setLoadingFinished] = useState(false);

  return (
    <BackToViewLayout backToView="MenuView">
      {!loadingFinished || scene === null ? (
        <LoadingView progress={loadingProgress} onComplete={() => setLoadingFinished(true)} />
      ) : (
        <ThreeDViewerPixelated
          scene={scene}
          resX={resolution.width}
          resY={resolution.height}
          debug
        />
      )}
    </BackToViewLayout>
  );
}
