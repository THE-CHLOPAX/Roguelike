import * as THREE from 'three';
import { describe, it, expect, vi, afterEach } from 'vitest';

import { MATERIALS } from '../../constants';
import { ShadersManager } from './ShadersManager';

// ShadersManager pulls in `logger` from @tgdf, whose barrel also touches
// electron-only modules (ipcRenderer) at import time — irrelevant here, but
// needs a browser-safe stand-in for the module graph to resolve at all.
vi.mock('electron', () => ({
  ipcRenderer: { send: vi.fn(), on: vi.fn(), removeListener: vi.fn(), once: vi.fn() },
}));

// Real WebGL context per test — jsdom has none, which is exactly why this
// suite runs in an actual browser (see vitest.browser.config.ts) instead of
// the default jsdom suite. Disposed in afterEach: browsers cap concurrent
// WebGL contexts, and each test creates a fresh renderer.
const renderersToDispose: THREE.WebGLRenderer[] = [];

function createRenderer(): THREE.WebGLRenderer {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  renderersToDispose.push(renderer);
  return renderer;
}

function createCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 5);
  return camera;
}

// renderer.info.programs is typed as nullable but always populated once a
// renderer exists — three.js only leaves it null before the first internal
// setup, which has already happened by the time these tests touch it.
function programCount(renderer: THREE.WebGLRenderer): number {
  return renderer.info.programs?.length ?? 0;
}

/**
 * Mirrors what the app's EffectComposer does: draws the scene into an
 * intermediate render target instead of straight to the screen. This is the
 * exact condition that exposed the original bug — three.js hard-codes
 * outputColorSpace to LinearSRGBColorSpace for any non-null, non-XR render
 * target, which changes a material's program cache key.
 */
function renderIntoIntermediateTarget(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Object3D,
  camera: THREE.Camera
): void {
  const target = new THREE.WebGLRenderTarget(4, 4);
  renderer.setRenderTarget(target);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  target.dispose();
}

afterEach(() => {
  renderersToDispose.forEach((renderer) => {
    renderer.dispose();
    renderer.forceContextLoss();
  });
  renderersToDispose.length = 0;
});

describe('ShadersManager', () => {
  it('adds an invisible warmup group covering every MATERIALS variant', () => {
    const shadersManager = new ShadersManager();

    expect(shadersManager.warmupGroup.visible).toBe(false);
    expect(shadersManager.warmupGroup.children).toHaveLength(Object.keys(MATERIALS).length);
  });

  it('shares compiled programs with real objects that reuse MATERIALS, even through an intermediate render target', async () => {
    const renderer = createRenderer();
    const scene = new THREE.Scene();
    const camera = createCamera();

    const shadersManager = new ShadersManager();
    scene.add(shadersManager.warmupGroup);

    await shadersManager.warmup(renderer, scene, camera);
    const baselineProgramCount = programCount(renderer);
    expect(baselineProgramCount).toBeGreaterThan(0);

    // Mirrors how gameplay objects (SacredOrb, ArcaneCircle, ...) build their
    // materials: calling the same MATERIALS factory ShadersManager warmed.
    const orbMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      MATERIALS.STANDARD_EMISSIVE({
        color: 0xf5c518,
        emissive: 0xf5c518,
        emissiveIntensity: 4,
        metalness: 0.4,
        roughness: 0.2,
      })
    );
    scene.add(orbMesh);

    renderIntoIntermediateTarget(renderer, scene, camera);

    expect(programCount(renderer)).toBe(baselineProgramCount);
    expect(shadersManager.checkForLateCompiles(renderer)).toBeNull();
  });

  it('reports a material variant that genuinely was not warmed up', async () => {
    const renderer = createRenderer();
    const scene = new THREE.Scene();
    const camera = createCamera();

    const shadersManager = new ShadersManager();
    scene.add(shadersManager.warmupGroup);

    await shadersManager.warmup(renderer, scene, camera);

    // A structurally different variant no MATERIALS factory produces
    // (normalMap isn't covered by any of them) — this MUST still recompile;
    // otherwise checkForLateCompiles would never catch a real gap.
    const normalMap = new THREE.DataTexture(new Uint8Array([128, 128, 255, 255]), 1, 1);
    normalMap.needsUpdate = true;
    const unwarmedMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ normalMap })
    );
    scene.add(unwarmedMesh);

    renderIntoIntermediateTarget(renderer, scene, camera);

    expect(shadersManager.checkForLateCompiles(renderer)).not.toBeNull();
  });

  it('would recompile without the render-target fix — proving the fix is load-bearing, not coincidental', () => {
    const renderer = createRenderer();
    const scene = new THREE.Scene();
    const camera = createCamera();

    // Same warmup material MATERIALS.STANDARD_EMISSIVE produces, but
    // compiled the naive way (no render target set) instead of through
    // ShadersManager.warmup().
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(0.01, 0.01), MATERIALS.STANDARD_EMISSIVE()));
    renderer.compile(scene, camera);
    const baselineProgramCount = programCount(renderer);

    const orbMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      MATERIALS.STANDARD_EMISSIVE({ color: 0xf5c518 })
    );
    scene.add(orbMesh);
    renderIntoIntermediateTarget(renderer, scene, camera);

    expect(programCount(renderer)).toBeGreaterThan(baselineProgramCount);
  });
});
