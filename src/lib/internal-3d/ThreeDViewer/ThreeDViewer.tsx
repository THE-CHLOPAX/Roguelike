import Stats from 'stats.js';
import * as THREE from 'three';
import { Scene, useGraphicsStore } from '@tgdf';
import { Pass } from 'three/examples/jsm/postprocessing/Pass';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useWebGLRenderer } from './useWebGLRenderer';
import { ThreeDViewerDebugInfo } from './ThreeDViewerDebugInfo';
import { isPerspectiveOrOrtographicCamera } from '../utils/isPerspectiveOrOrtographicCamera';

export type ThreeDViewerProps = {
  scene: Scene;
  camera: THREE.Camera;
  resX?: number;
  resY?: number;
  width?: number;
  height?: number;
  isPaused?: boolean;
  debug?: boolean;
  postProcessingPasses?: Pass[];
};

export function ThreeDViewer({
  scene,
  camera,
  resX,
  resY,
  width,
  height,
  isPaused,
  debug,
  postProcessingPasses = [],
}: ThreeDViewerProps) {
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const statsRef = useRef<Stats | null>(null);

  const { antialiasing, resolution } = useGraphicsStore();

  const rendererOptionsMemo = useMemo<THREE.WebGLRendererParameters>(() => {
    return {
      antialias: antialiasing,
    };
  }, [antialiasing]);

  const postProcessingPassesMemo = useMemo(() => {
    return [...postProcessingPasses];
  }, [postProcessingPasses]);

  const { renderer, composer, containerRef } = useWebGLRenderer({
    resolution: { width: resX ?? resolution.width, height: resY ?? resolution.height },
    options: rendererOptionsMemo,
    postProcessingPasses: postProcessingPassesMemo,
  });

  const targetRenderer = useMemo((): THREE.WebGLRenderer | null => {
    if (composer) {
      return composer.renderer;
    }
    return renderer;
  }, [composer, renderer]);

  const handleStatsChange = useCallback((stats: Stats | null) => {
    statsRef.current = stats;
  }, []);

  const renderFrame = useCallback(() => {
    if (composer) {
      composer.renderer.info.reset();
      composer.render();
    } else if (renderer) {
      renderer.render(scene, camera);
    }
  }, [scene, camera, composer, renderer]);

  const rendererLoop = useCallback(() => {
    const deltaTime = clockRef.current.getDelta();
    statsRef.current?.begin();
    renderFrame();
    scene.update(deltaTime, targetRenderer);
    statsRef.current?.end();
  }, [scene, renderFrame, targetRenderer]);

  const pauseRendering = useCallback(
    (targetRenderer: THREE.WebGLRenderer) => {
      targetRenderer.setAnimationLoop(null);
      scene.disableInput();
    },
    [scene]
  );

  const startRendering = useCallback(
    (targetRenderer: THREE.WebGLRenderer) => {
      clockRef.current.oldTime = performance.now();
      targetRenderer.setAnimationLoop(rendererLoop);
      scene.enableInput();
    },
    [scene, rendererLoop]
  );

  // On isPaused change
  useEffect(() => {
    if (isPaused && targetRenderer) {
      pauseRendering(targetRenderer);
      renderFrame();
    } else if (!isPaused && targetRenderer) {
      startRendering(targetRenderer);
    }
  }, [isPaused, targetRenderer, pauseRendering, startRendering]);

  // On resolution change
  useEffect(() => {
    if (isPaused) {
      renderFrame();
    }

    if (!isPerspectiveOrOrtographicCamera(camera)) return;

    const aspect = resolution.width / resolution.height;

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = aspect;
    } else if (camera instanceof THREE.OrthographicCamera) {
      const frustumHeight = camera.top - camera.bottom;
      const frustumWidth = frustumHeight * aspect;

      camera.left = -frustumWidth / 2;
      camera.right = frustumWidth / 2;
    }

    camera.updateProjectionMatrix();
  }, [resolution]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '100%',
        overflow: 'hidden',
      }}
    >
      {debug && (
        <ThreeDViewerDebugInfo
          renderer={composer ? composer.renderer : renderer}
          scene={scene}
          onStatsChange={handleStatsChange}
        />
      )}
    </div>
  );
}
