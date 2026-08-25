import { useEffect, useState } from 'react';
import { executeAsyncOperationsWithProgress, useAssetStore, Scene } from '@tgdf';

import { ModelRecord } from '../types';
import { WorldGenerator, WorldGeneratorOutput } from '../classes/worldGenerator/types';

export type UseLoadSceneProps<TSceneData> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sceneClass: new (sceneData?: any) => Scene;
  worldGenerator?: WorldGenerator;
  sceneBuilder?: (worldGenOutput: WorldGeneratorOutput) => Promise<TSceneData>;
  characterModels?: ModelRecord[];
};

export type UseLoadSceneResult = {
  scene: Scene | null;
  loadingProgress: number;
  loading: boolean;
};

export function useLoadScene<TSceneData = undefined>({
  sceneClass,
  worldGenerator,
  sceneBuilder,
  characterModels = [],
}: UseLoadSceneProps<TSceneData>): UseLoadSceneResult {
  const [scene, setScene] = useState<Scene | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const { loadModelGLTF } = useAssetStore.getState();

    const worldGenPromise: Promise<WorldGeneratorOutput | undefined> = worldGenerator
      ? worldGenerator()
      : Promise.resolve(undefined);

    const sceneBuilderPromise: Promise<TSceneData | undefined> = sceneBuilder
      ? worldGenPromise.then((worldGenOutput) =>
          sceneBuilder(worldGenOutput as WorldGeneratorOutput)
        )
      : Promise.resolve(undefined);

    const characterModelOperations = characterModels.map((model) =>
      loadModelGLTF(model.id, model.path, {
        nameExtractor: model.nameExtractor,
        centerOrigin: true,
      })
    );

    const trackedOperations: Array<Promise<unknown>> = [
      ...(worldGenerator ? [worldGenPromise] : []),
      ...(sceneBuilder ? [sceneBuilderPromise] : []),
      ...characterModelOperations,
    ];

    executeAsyncOperationsWithProgress(trackedOperations, setLoadingProgress).then(async () => {
      if (cancelled) return;
      const sceneData = await sceneBuilderPromise;
      setScene(new sceneClass(sceneData));
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
