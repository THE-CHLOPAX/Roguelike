import { useEffect, useState } from 'react';
import { executeAsyncOperationsWithProgress, Scene, SceneConstructorOptions } from '@tgdf';

export type UseLoadSceneProps = {
  sceneClass: new (options: SceneConstructorOptions) => Scene;
  sceneParams?: SceneConstructorOptions;
  asyncPreloadOperations?: Array<Promise<unknown>>;
};

export type UseLoadSceneResult = {
  scene: Scene | null;
  loadingProgress: number;
  loading: boolean;
};

export function useLoadScene({
  sceneClass,
  sceneParams,
  asyncPreloadOperations = [],
}: UseLoadSceneProps): UseLoadSceneResult {
  const [scene, setScene] = useState<Scene | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // Complete async preload operations and track progress
  useEffect(() => {
    if (asyncPreloadOperations.length === 0) {
      setLoadingProgress(1);
      return;
    }
    executeAsyncOperationsWithProgress(asyncPreloadOperations, setLoadingProgress);
  }, []);

  // Scene cleanup on unmount
  useEffect(() => {
    return () => {
      scene?.dispose();
    };
  }, [scene]);

  // Instantiate scene once assets are loaded
  useEffect(() => {
    if (loadingProgress === 1 && loading) {
      const newScene = new sceneClass({ ...sceneParams });
      setScene(newScene);
      setLoading(false);
    }
  }, [loadingProgress, loading, sceneClass]);

  return { scene, loadingProgress, loading };
}
