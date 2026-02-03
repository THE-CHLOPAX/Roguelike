import * as THREE from 'three';
import { useCallback, useEffect, useMemo } from 'react';
import { EffectComposer, Pass } from 'three/examples/jsm/postprocessing/EffectComposer';

export type UseWebGLRendererReturn = {
  renderer: THREE.WebGLRenderer | null;
  composer: EffectComposer | null;
  containerRef: (node: HTMLDivElement | null) => void;
};

export type UseWebGLRendererProps = {
  resolution: { width: number; height: number };
  options: THREE.WebGLRendererParameters;
  postProcessingPasses: Pass[];
};

export function useWebGLRenderer({
  resolution,
  options,
  postProcessingPasses = [],
}: UseWebGLRendererProps): UseWebGLRendererReturn {
  // Renderer initializer
  const renderer: THREE.WebGLRenderer | null = useMemo(() => {
    console.log('Creating WebGLRenderer with options: ', options);
    return new THREE.WebGLRenderer({ ...options });
  }, [options]);

  // Composer initializer
  const composer: EffectComposer | null = useMemo(() => {
    if (renderer === null) return null;
    if (postProcessingPasses.length === 0) return null;

    const effectComposer = new EffectComposer(renderer);
    effectComposer.renderer.info.autoReset = false;

    postProcessingPasses.forEach((pass) => {
      effectComposer.addPass(pass);
    });

    return effectComposer;
  }, [postProcessingPasses, renderer]);

  // Update resolution
  useEffect(() => {
    if (composer) {
      const { width, height } = resolution;
      composer.setSize(width, height);
    }
    if (renderer) {
      const { width, height } = resolution;
      renderer.setSize(width, height, false);
    }
  }, [resolution, renderer, composer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (composer) {
        console.log('Disposing EffectComposer');
        composer.renderer.domElement.remove();
        composer.dispose();
      }
      if (renderer) {
        console.log('Disposing WebGLRenderer');
        renderer.domElement.remove();
        renderer.dispose();
        renderer.forceContextLoss();
      }
    };
  }, [composer, renderer]);

  // Container ref callback - appends the renderer's canvas to the div
  const containerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && renderer) {
        console.log('Appending renderer DOM element to container: ', node);
        node.appendChild(renderer.domElement);
      }
    },
    [renderer]
  );

  return {
    renderer,
    composer,
    containerRef,
  };
}
