import { useState } from 'react';
import { useGraphicsStore } from '@tgdf';

import { MOCK_WORLD_GEN_OUTPUT } from '3D/classes/worldGenerator/const';
import { buildDungeonLevelScene } from '3D/classes/worldGenerator/dungeon/buildDungeonLevelScene';

import { LoadingView } from './LoadingView';
import { MODELS, TEXTURES } from '../../3D/constants';
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
    preloadAssets: [
      MODELS.MONK,
      MODELS.DUNGEON_DOOR,
      MODELS.DUNGEON_DOOR_FRAME,
      MODELS.DUNGEON_PILLAR,
      MODELS.DUNGEON_TORCH_WALL,
      MODELS.DUNGEON_WALL_BRICK_TALL,
      MODELS.DUNGEON_FLOOR,
      TEXTURES.DUNGEON_BLOCKS,
      TEXTURES.DUNGEON_PROPS_1,
      TEXTURES.DUNGEON_PROPS_2,
      TEXTURES.DUNGEON_WALLS,
    ],
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
