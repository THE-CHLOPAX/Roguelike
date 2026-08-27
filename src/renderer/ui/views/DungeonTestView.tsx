import { useState } from 'react';
import { useGraphicsStore } from '@tgdf';

import { MOCK_WORLD_GEN_OUTPUT } from '3D/classes/worldGenerator/const';
import { buildDungeonLevelScene } from '3D/classes/worldGenerator/dungeon/buildDungeonLevelScene';

import { MODELS } from '../../3D/constants';
import { LoadingView } from './LoadingView';
import { useLoadScene } from '../../3D/hooks/useLoadScene';
import { BackToViewLayout } from '../layouts/BackToViewLayout';
import { ThreeDViewerPixelated } from '../components/ThreeDViewerPixelated';
import { DungeonLevelScene } from '../../3D/classes/scenes/DungeonLevelScene';

export function DungeonTestView() {
  const { resolution } = useGraphicsStore();
  const { scene, loadingProgress } = useLoadScene({
    sceneClass: DungeonLevelScene,
    worldGenerator: () => Promise.resolve(MOCK_WORLD_GEN_OUTPUT),
    sceneBuilder: buildDungeonLevelScene,
    characterModels: [MODELS.MONK],
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
