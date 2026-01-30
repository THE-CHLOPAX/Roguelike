import Stats from 'stats.js';
import * as THREE from 'three';
import { useCallback, useEffect, useRef } from 'react';
import { Scene, logger, useGraphicsStore } from '@tgdf';

import { SceneEventsMap } from '../internal-3d/types/scene';

type ThreeDViewerProps<T extends SceneEventsMap = SceneEventsMap> = {
  scene: Scene<T>;
  camera: THREE.Camera;
  resX?: number;
  resY?: number;
  width?: number;
  height?: number;
  isPaused?: boolean;
  debug?: boolean;
};

type RendererState = {
  resolutionX: number;
  resolutionY: number;
  antialiasing: boolean;
  sceneObjects?: number;
  drawCalls?: number;
  facesCount?: number;
};

export function ThreeDViewer<T extends SceneEventsMap = SceneEventsMap>({
  scene,
  camera,
  resX,
  resY,
  width,
  height,
  isPaused,
  debug,
}: ThreeDViewerProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const debugContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statsRef = useRef<Stats | null>(null);

  const rendererCleanupRef = useRef<(() => void) | undefined>(null);
  const rafIdRef = useRef<number | null>(null);

  const { antialiasing } = useGraphicsStore();

  const renderFrame = useCallback(() => {
    if (rendererRef.current) {
      const deltaTime = clockRef.current.getDelta();
      statsRef.current?.begin();
      rendererRef.current.render(scene, camera);
      scene.update(deltaTime);
      statsRef.current?.end();
    }
  }, [scene, camera]);

  function updateCameraAspect() {
    if (camera instanceof THREE.PerspectiveCamera && canvasRef.current) {
      camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      camera.updateProjectionMatrix();
    }
  }

  function setRendererResolution(width: number, height: number) {
    if (rendererRef.current) {
      rendererRef.current.setSize(width, height, false);
      updateCameraAspect();
    }
  }

  function setCanvasSize(width?: number, height?: number) {
    if (canvasRef.current) {
      canvasRef.current.style.width = width ? width + 'px' : '100%';
      canvasRef.current.style.height = height ? height + 'px' : '100%';
      updateCameraAspect();
    }
  }

  function disposeRenderer() {
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current.forceContextLoss();
      rendererRef.current = null;
    }
  }

  function resetRendererAndCanvas() {
    if (rendererCleanupRef.current) {
      rendererCleanupRef.current();
    }
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
  }

  const pauseRendering = useCallback(() => {
    if (rendererRef.current) {
      rendererRef.current.setAnimationLoop(null);
      scene.disableInput();
    }
  }, [scene]);

  const startRendering = useCallback(() => {
    if (rendererRef.current) {
      clockRef.current.oldTime = performance.now();
      rendererRef.current.setAnimationLoop(renderFrame);
      scene.enableInput();
    }
  }, [scene, renderFrame]);

  function initializeRenderer() {
    if (!containerRef.current) {
      logger({ message: 'Container ref is null', type: 'error' });
      return;
    }

    // Create a fresh canvas element
    const canvas = document.createElement('canvas');
    containerRef.current.appendChild(canvas);
    canvasRef.current = canvas;
    setCanvasSize(width, height);

    // Create renderer with the new canvas
    rendererRef.current = new THREE.WebGLRenderer({
      antialias: antialiasing,
      canvas,
    });

    rendererRef.current.shadowMap.enabled = true;

    setRendererResolution(
      resX ?? (canvasRef.current?.clientWidth || 800),
      resY ?? (canvasRef.current?.clientHeight || 600)
    );

    if (!isPaused) {
      startRendering();
    } else {
      rendererRef.current.render(scene, camera);
      pauseRendering();
    }

    // Return cleanup
    return () => {
      disposeRenderer();
      // Remove the canvas from DOM
      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
      }
    };
  }

  function updateLoop(): number {
    // Read renderer state directly in the loop to get latest values
    if (rendererRef.current) {
      const size = rendererRef.current.getSize(new THREE.Vector2());
      const newState: RendererState = {
        resolutionX: size.x,
        resolutionY: size.y,
        antialiasing: rendererRef.current.getContext().getContextAttributes()?.antialias || false,
        sceneObjects: scene.children.length,
        drawCalls: rendererRef.current.info.render.calls,
        facesCount: rendererRef.current.info.render.triangles,
      };

      if (debugContainerRef.current) {
        Object.entries(newState).forEach(([key, value]) => {
          const preElement = debugContainerRef.current!.querySelector(`pre[data-key='${key}']`);
          if (preElement) {
            preElement.textContent = `${key}: ${value}`;
          } else {
            const newPre = document.createElement('pre');
            newPre.style.color = 'white';
            newPre.style.fontSize = '10px';
            newPre.dataset.key = key;
            newPre.textContent = `${key}: ${value}`;
            debugContainerRef.current!.appendChild(newPre);
          }
        });
      }
    }
    return requestAnimationFrame(updateLoop);
  }

  // Renderer initialization
  useEffect(() => {
    if (!statsRef.current) {
      statsRef.current = new Stats();
      statsRef.current.dom.style.position = 'static';
      debugContainerRef.current?.prepend(statsRef.current.dom);
    }

    rendererCleanupRef.current = initializeRenderer();
    rafIdRef.current = updateLoop();

    return () => {
      resetRendererAndCanvas();
      scene.dispose();
    };
  }, []);

  // On antialiasing change, re-initialize renderer
  useEffect(() => {
    if (!canvasRef.current) return;

    resetRendererAndCanvas();

    rendererCleanupRef.current = initializeRenderer();
    rafIdRef.current = updateLoop();
  }, [antialiasing]);

  // Update resolution when change
  useEffect(() => {
    if (!canvasRef.current) return;

    setRendererResolution(
      resX ?? canvasRef.current?.clientWidth,
      resY ?? canvasRef.current?.clientHeight
    );
    // Render a frame to apply changes immediately
    if (rendererRef.current) {
      rendererRef.current.render(scene, camera);
    }
  }, [resX, resY]);

  // Update canvas size when width/height change
  useEffect(() => {
    setCanvasSize(width, height);
    // Render a frame to apply changes immediately
    if (rendererRef.current) {
      rendererRef.current.render(scene, camera);
    }
  }, [width, height]);

  // Pause or resume rendering loop
  useEffect(() => {
    if (rendererRef.current) {
      if (isPaused) {
        pauseRendering();
      } else {
        startRendering();
      }
    }
  }, [isPaused]);

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
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '10px',
          }}
          ref={debugContainerRef}
        ></div>
      )}
    </div>
  );
}
