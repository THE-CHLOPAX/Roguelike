import * as THREE from 'three';
import { init } from '@recast-navigation/core';
import { describe, it, expect, vi, assert, beforeAll } from 'vitest';

vi.mock('electron', () => ({
  ipcRenderer: { send: vi.fn(), on: vi.fn(), removeListener: vi.fn(), once: vi.fn() },
}));

import { Scene } from './Scene/Scene';
import { NavMeshManager } from './NavMeshManager';
import { MockCamera } from './testUtils/MockCamera';

class TestScene extends Scene {
  camera = new MockCamera();
}

function buildFloorMesh(): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(20, 0.2, 20));
  mesh.position.set(0, -0.1, 0);
  return mesh;
}

describe('NavMeshManager', () => {
  beforeAll(async () => {
    await init();
  });

  describe('dispose', () => {
    it('destroys the underlying NavMesh, TileCache, and all Crowds', () => {
      const manager = new NavMeshManager(new TestScene(), buildFloorMesh());
      assert(manager.navMesh !== null, 'Expected NavMesh to be generated');

      const navMesh = manager.navMesh;
      const tileCache = manager['_tileCache'];
      assert(tileCache !== null, 'Expected TileCache to be generated');

      const crowd = manager.addCrowd('test-crowd', { maxAgents: 1, maxAgentRadius: 0.5 });
      assert(crowd !== null, 'Expected Crowd to be created');

      const navMeshDestroySpy = vi.spyOn(navMesh, 'destroy');
      const tileCacheDestroySpy = vi.spyOn(tileCache, 'destroy');
      const crowdDestroySpy = vi.spyOn(crowd, 'destroy');

      manager.dispose();

      expect(navMeshDestroySpy).toHaveBeenCalledOnce();
      expect(tileCacheDestroySpy).toHaveBeenCalledOnce();
      expect(crowdDestroySpy).toHaveBeenCalledOnce();
      expect(manager.navMesh).toBeNull();
      expect(manager['_crowdMap'].size).toBe(0);
    });

    it('removes all event listeners', () => {
      const manager = new NavMeshManager(new TestScene(), buildFloorMesh());
      const handler = vi.fn();
      manager.events.on('crowdremoved', handler);

      manager.dispose();
      manager.events.trigger('crowdremoved', { crowdId: 'test-crowd' });

      expect(handler).not.toHaveBeenCalled();
      expect(manager.events.listeners).toHaveLength(0);
    });

    it('does not throw when called with no crowds added', () => {
      const manager = new NavMeshManager(new TestScene(), buildFloorMesh());

      expect(() => manager.dispose()).not.toThrow();
    });
  });
});
