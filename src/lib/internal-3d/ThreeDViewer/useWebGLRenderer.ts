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
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      composer.setSize(width, height);
    }
    if (renderer) {
      const { width, height } = resolution;
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.setSize(width, height, false);
    }
  }, [resolution]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (composer) {
        composer.renderer.domElement.remove();
        composer.dispose();
      }
      if (renderer) {
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
        node.appendChild(renderer.domElement);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
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
