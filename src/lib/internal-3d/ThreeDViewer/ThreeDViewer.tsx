import Stats from 'stats.js';
import * as THREE from 'three';
import { useCallback, useEffect, useRef } from 'react';
import { Pass } from 'three/examples/jsm/postprocessing/Pass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { Scene, logger, useGraphicsStore, type SceneEventsMap } from '@tgdf';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';

export type ThreeDViewerProps<T extends SceneEventsMap = SceneEventsMap> = {
  scene: Scene<T>;
  camera: THREE.Camera;
  resX?: number;
  resY?: number;
  width?: number;
  height?: number;
  isPaused?: boolean;
  debug?: boolean;
  postProcessingPasses?: Pass[];
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
  postProcessingPasses = [],
}: ThreeDViewerProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const debugContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const composerRef = useRef<EffectComposer | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const statsRef = useRef<Stats | null>(null);

  const rendererCleanupRef = useRef<(() => void) | undefined>(null);
  const rafIdRef = useRef<number | null>(null);

  const { antialiasing } = useGraphicsStore();

  const rendererLoop = useCallback(() => {
    if (rendererRef.current) {
      const deltaTime = clockRef.current.getDelta();
      statsRef.current?.begin();
      renderFrame();
      scene.update(deltaTime, rendererRef.current);
      statsRef.current?.end();
    }
  }, [scene, camera]);

  function renderFrame() {
    // Render with post-processing if composer exists
    if (composerRef.current) {
      composerRef.current.render();
    } else if (rendererRef.current) {
      rendererRef.current.render(scene, camera);
    }
  }

  function updateCameraAspect() {
    if (camera instanceof THREE.PerspectiveCamera && canvasRef.current) {
      camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      camera.updateProjectionMatrix();
    }
  }

  function setRendererResolution(width: number, height: number) {
    if (rendererRef.current) {
      rendererRef.current.setSize(width, height, false);
      if (composerRef.current) {
        composerRef.current.setSize(width, height);
      }
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
    if (composerRef.current) {
      composerRef.current.dispose();
      composerRef.current = null;
    }

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
      rendererRef.current.setAnimationLoop(rendererLoop);
      scene.enableInput();
    }
  }, [scene, rendererLoop]);

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

    // Setup post-processing if passes are provided
    if (postProcessingPasses.length > 0) {
      composerRef.current = new EffectComposer(rendererRef.current);

      // Always add RenderPass first
      const renderPass = new RenderPass(scene, camera);
      composerRef.current.addPass(renderPass);

      // Add user-provided passes
      postProcessingPasses.forEach((pass) => {
        composerRef.current!.addPass(pass);
      });
    }

    if (!isPaused) {
      startRendering();
    } else {
      renderFrame();
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

  // On antialiasing or post processing change, re-initialize renderer
  useEffect(() => {
    if (!canvasRef.current) return;

    resetRendererAndCanvas();

    rendererCleanupRef.current = initializeRenderer();
    rafIdRef.current = updateLoop();
  }, [antialiasing, postProcessingPasses]);

  // Update resolution when change
  useEffect(() => {
    if (!canvasRef.current) return;

    setRendererResolution(
      resX ?? canvasRef.current?.clientWidth,
      resY ?? canvasRef.current?.clientHeight
    );
    // Render a frame to apply changes immediately
    renderFrame();
  }, [resX, resY]);

  // Update canvas size when width/height change
  useEffect(() => {
    setCanvasSize(width, height);
    // Render a frame to apply changes immediately
    renderFrame();
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
