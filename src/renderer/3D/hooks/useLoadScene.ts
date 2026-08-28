import { useEffect, useState } from 'react';
import { executeAsyncOperationsWithProgress, useAssetStore, AssetRecord, ModelRecord } from '@tgdf';

import { LevelSceneBuilder } from '../types';
import { GameScene } from '../classes/scenes/GameScene';
import { WorldGenerator, WorldGeneratorOutput } from '../classes/worldGenerator/types';

export type UseLoadSceneProps = {
  sceneClass: new () => GameScene;
  worldGenerator?: WorldGenerator;
  sceneBuilder?: LevelSceneBuilder;
  preloadAssets?: AssetRecord[];
};

export type UseLoadSceneResult = {
  scene: GameScene | null;
  loadingProgress: number;
  loading: boolean;
};

function loadModelRecord(record: ModelRecord): Promise<unknown> {
  const { loadModelGLTF, loadModelFBX, loadModelJSON } = useAssetStore.getState();
  const extension = record.path.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'fbx':
      return loadModelFBX(record.id, record.path, {
        nameExtractor: record.nameExtractor,
        centerOrigin: true,
      });
    case 'json':
      return loadModelJSON(record.id, record.path, record.nameExtractor);
    default:
      return loadModelGLTF(record.id, record.path, {
        nameExtractor: record.nameExtractor,
        centerOrigin: true,
      });
  }
}

function loadAssetRecord(record: AssetRecord): Promise<unknown> {
  if (record.type === 'texture') {
    return useAssetStore.getState().loadTexture(record.id, record.path, record.colorSpace);
  }
  return loadModelRecord(record);
}

export function useLoadScene({
  sceneClass,
  worldGenerator,
  sceneBuilder,
  preloadAssets = [],
}: UseLoadSceneProps): UseLoadSceneResult {
  const [scene, setScene] = useState<GameScene | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const newScene = new sceneClass();

    const worldGenPromise: Promise<WorldGeneratorOutput | undefined> = worldGenerator
      ? worldGenerator()
      : Promise.resolve(undefined);

    const preloadAssetOperations = preloadAssets.map(loadAssetRecord);

    const sceneReadyPromise = newScene.initializePhysics().then(async () => {
      if (!sceneBuilder) return;

      const worldGenOutput = await worldGenPromise;

      await Promise.all(preloadAssetOperations);
      const { floorMesh } = await sceneBuilder(newScene, worldGenOutput as WorldGeneratorOutput);

      await newScene.completeLevelInitialization(floorMesh);
    });

    const trackedOperations: Array<Promise<unknown>> = [
      ...(worldGenerator ? [worldGenPromise] : []),
      sceneReadyPromise,
      ...preloadAssetOperations,
    ];

    executeAsyncOperationsWithProgress(trackedOperations, setLoadingProgress).then(() => {
      if (cancelled) return;
      setScene(newScene);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Scene cleanup on unmount
  useEffect(() => {
    return () => {
      scene?.dispose();
    };
  }, [scene]);

  return { scene, loadingProgress, loading };
}
