import * as THREE from 'three';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ResourceTracker } from './ResourceTracker';

describe('ResourceTracker', () => {
  let tracker: ResourceTracker;

  beforeEach(() => {
    tracker = new ResourceTracker();
  });

  it('should dispose of geometry', () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const disposeSpy = vi.spyOn(geometry, 'dispose');

    tracker.track(geometry);
    tracker.dispose();

    expect(disposeSpy).toHaveBeenCalledOnce();
  });

  it('should dispose of material and its textures', () => {
    const texture = new THREE.Texture();
    const material = new THREE.MeshStandardMaterial({ map: texture });

    const materialDisposeSpy = vi.spyOn(material, 'dispose');
    const textureDisposeSpy = vi.spyOn(texture, 'dispose');

    tracker.track(material);
    tracker.dispose();

    expect(materialDisposeSpy).toHaveBeenCalledOnce();
    expect(textureDisposeSpy).toHaveBeenCalledOnce();
  });

  it('should dispose of mesh and all its resources', () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geometry, material);

    const geometryDisposeSpy = vi.spyOn(geometry, 'dispose');
    const materialDisposeSpy = vi.spyOn(material, 'dispose');

    tracker.track(mesh);
    tracker.dispose();

    expect(geometryDisposeSpy).toHaveBeenCalledOnce();
    expect(materialDisposeSpy).toHaveBeenCalledOnce();
  });

  it('should handle shader material uniforms', () => {
    const texture = new THREE.Texture();
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
      },
    });

    const textureDisposeSpy = vi.spyOn(texture, 'dispose');

    tracker.track(material);
    tracker.dispose();

    expect(textureDisposeSpy).toHaveBeenCalledOnce();
  });

  it('should handle array of materials', () => {
    const materials = [new THREE.MeshBasicMaterial(), new THREE.MeshStandardMaterial()];

    const spies = materials.map((m) => vi.spyOn(m, 'dispose'));

    tracker.track(materials);
    tracker.dispose();

    spies.forEach((spy) => expect(spy).toHaveBeenCalledOnce());
  });
});
