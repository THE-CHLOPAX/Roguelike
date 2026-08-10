import { vi } from 'vitest';
import * as THREE from 'three';

import { SceneCamera } from '../types/scene';

// Real THREE.PerspectiveCamera so instanceof/projection behavior stays intact, with
// SceneCamera's methods as vi.fn() spies so tests can assert calls without extra setup.
// Centralized here so a SceneCamera contract change only needs updating in one place.
export class MockCamera extends THREE.PerspectiveCamera implements SceneCamera {
  public update = vi.fn<(deltaTime: number) => void>();
}
