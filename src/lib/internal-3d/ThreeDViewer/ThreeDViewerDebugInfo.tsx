import Stats from 'stats.js';
import * as THREE from 'three';
import { useCallback, useEffect, useRef } from 'react';

export type RendererState = {
  resolutionX: number;
  resolutionY: number;
  antialiasing: boolean;
  sceneObjects?: number;
  drawCalls?: number;
  triangles?: number;
};

export type ThreeDViewerDebugInfoProps = {
  renderer: THREE.WebGLRenderer | null;
  scene: THREE.Scene;
  onStatsChange: (stats: Stats | null) => void;
};

export function ThreeDViewerDebugInfo({
  renderer,
  scene,
  onStatsChange,
}: ThreeDViewerDebugInfoProps) {
  const ref = useRef<HTMLDivElement>(null);

  const updateDebugStats = useCallback(() => {
    if (!renderer || !ref.current) return;

    const size = renderer.getSize(new THREE.Vector2());

    const newState: RendererState = {
      resolutionX: size.x,
      resolutionY: size.y,
      sceneObjects: scene.children.length,
      antialiasing: renderer.getContext().getContextAttributes()?.antialias || false,
      drawCalls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
    };

    Object.entries(newState).forEach(([key, value]) => {
      if (!ref.current) return;
      const preElement = ref.current.querySelector(`pre[data-key='${key}']`);
      if (preElement) {
        preElement.textContent = `${key}: ${value}`;
      } else {
        const newPre = document.createElement('pre');
        newPre.style.color = 'white';
        newPre.style.fontSize = '10px';
        newPre.dataset.key = key;
        newPre.textContent = `${key}: ${value}`;
        ref.current.appendChild(newPre);
      }
    });
  }, [renderer, scene]);

  useEffect(() => {
    const interval = setInterval(updateDebugStats, 100);
    return () => clearInterval(interval);
  }, [updateDebugStats]);

  useEffect(() => {
    const stats = new Stats();

    if (ref.current) {
      stats.dom.style.position = 'static';
      ref.current.prepend(stats.dom);
    }
    // Notify parent of the stats instance
    onStatsChange(stats);
    return () => {
      stats.dom.remove();
      onStatsChange(null);
    };
  }, [onStatsChange]);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        zIndex: 1,
        top: 10,
        left: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '10px',
      }}
    ></div>
  );
}
