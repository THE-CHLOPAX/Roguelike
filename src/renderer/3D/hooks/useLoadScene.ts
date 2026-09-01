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

    const nextScene = new sceneClass();

    const preloadAssetOperations = preloadAssets.map(loadAssetRecord);

    // The build (physics -> assets -> sceneBuilder -> finalize) is tracked as a single
    // unit alongside the individual asset loads, so the progress bar advances as each
    // asset resolves without those loads also being counted a second time inside the
    // build promise.
    const buildPromise = nextScene
      .initializePhysics()
      .then(() => Promise.all(preloadAssetOperations))
      .then(() => sceneBuilder(nextScene))
      .then(() => nextScene.completeLevelInitialization());

    const trackedOperations: Array<Promise<unknown>> = [...preloadAssetOperations, buildPromise];

    const reportProgress = (progress: number): void => {
      if (!cancelled) setLoadingProgress(progress);
    };

    executeAsyncOperationsWithProgress(trackedOperations, reportProgress).then(() => {
      if (cancelled) {
        // Component unmounted mid-load; tear down the fully-built scene (physics
        // world, nav mesh) that the cleanup effect below never received.
        nextScene.dispose();
        return;
      }
      setScene(nextScene);
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
