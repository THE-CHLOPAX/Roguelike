import { useEffect, useState } from 'react';
import {
  executeAsyncOperationsWithProgress,
  useAssetStore,
  AssetRecord,
  ModelRecord,
  Scene,
} from '@tgdf';

import { GameScene } from '../classes/scenes/GameScene';

export type UseLoadSceneProps = {
  sceneClass: new () => GameScene;
  sceneBuilder: (scene: Scene) => Promise<void>;
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
  sceneBuilder,
  preloadAssets = [],
}: UseLoadSceneProps): UseLoadSceneResult {
  const [scene, setScene] = useState<GameScene | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const scene = new sceneClass();

    const preloadAssetOperations = preloadAssets.map(loadAssetRecord);

    const sceneReadyPromise = scene
      .initializePhysics()
      .then(() => Promise.all(preloadAssetOperations))
      .then(() => sceneBuilder(scene))
      .then(() => scene.completeLevelInitialization());

    const trackedOperations: Array<Promise<unknown>> = [
      sceneReadyPromise,
      ...preloadAssetOperations,
    ];

    executeAsyncOperationsWithProgress(trackedOperations, setLoadingProgress).then(() => {
      if (cancelled) return;
      setScene(scene);
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
