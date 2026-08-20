import * as THREE from 'three';
import { describe, it, expect } from 'vitest';

import { PointLightPool } from './PointLightPool';

describe('PointLightPool', () => {
  describe('release', () => {
    it('resets a released light back to its pool defaults', () => {
      const pool = new PointLightPool(2);
      const parent = new THREE.Object3D();
      const light = pool.acquire(parent);
      if (!light) throw new Error('expected a light to be acquired');

      // Simulate a borrower configuring the light
      light.color.set(0xff0000);
      light.intensity = 5;
      light.distance = 12;
      light.decay = 1;
      light.position.set(3, 4, 5);

      pool.release(light);

      expect(light.color.getHex()).toBe(0xffffff);
      expect(light.intensity).toBe(0);
      expect(light.distance).toBe(0);
      expect(light.decay).toBe(2);
      expect(light.position.toArray()).toEqual([0, 0, 0]);
    });

    it('reparents a released light back onto the pool root, out of the borrower', () => {
      const pool = new PointLightPool(1);
      const parent = new THREE.Object3D();
      const light = pool.acquire(parent);
      if (!light) throw new Error('expected a light to be acquired');
      expect(light.parent).toBe(parent);

      pool.release(light);

      expect(light.parent).toBe(pool.root);
      expect(parent.children).not.toContain(light);
    });

    it('makes a released light acquirable again', () => {
      const pool = new PointLightPool(1);
      const parent = new THREE.Object3D();
      const light = pool.acquire(parent);

      pool.release(light);

      expect(pool.acquire(parent)).toBe(light);
    });

    it('rejects a light that was never created by this pool', () => {
      const pool = new PointLightPool(1);
      const parent = new THREE.Object3D();
      const externalLight = new THREE.PointLight(0x00ff00, 3);
      parent.add(externalLight);

      pool.release(externalLight);

      // Untouched: not reparented, not reset, and not slipped into the pool's
      // own available list where a later acquire() could hand it back out.
      expect(externalLight.parent).toBe(parent);
      expect(externalLight.color.getHex()).toBe(0x00ff00);
      expect(externalLight.intensity).toBe(3);

      const acquired = [pool.acquire(parent)];
      expect(acquired).not.toContain(externalLight);
      // Pool size was 1 and never legitimately released — still exhausted.
      expect(pool.acquire(parent)).toBeNull();
    });

    it('is a no-op when called with null', () => {
      const pool = new PointLightPool(1);

      expect(() => pool.release(null)).not.toThrow();
    });

    it('is a no-op on a light that was already released', () => {
      const pool = new PointLightPool(2);
      const parent = new THREE.Object3D();
      const light = pool.acquire(parent);
      pool.release(light);

      light?.position.set(9, 9, 9);
      pool.release(light);

      // A double-release must not re-add the same light to `_available`
      // twice — otherwise two acquire() calls could hand out one instance.
      const first = pool.acquire(parent);
      const second = pool.acquire(parent);
      expect(first).toBe(light);
      expect(second).not.toBe(light);
    });
  });
});
