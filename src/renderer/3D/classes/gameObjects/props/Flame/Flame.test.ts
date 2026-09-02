import * as THREE from 'three';
import { describe, it, expect } from 'vitest';

import { createFlameMaterial, updateFlameMaterialTime } from './flameMaterial';
import { createFlameParticlesGeometry, FLAME_BOUNDING_RADIUS } from './flameGeometry';
import { Flame, createFlameInstancedMesh, DEFAULT_FLAME_PARTICLE_COUNT } from './Flame';

const CONSTANT_RANDOM = () => 0.5;
const VERTICES_PER_PARTICLE = 6;

describe('createFlameParticlesGeometry', () => {
  it('builds one square (6 vertices) per particle', () => {
    const geometry = createFlameParticlesGeometry(20, CONSTANT_RANDOM);

    expect(geometry.getAttribute('position').count).toBe(20 * VERTICES_PER_PARTICLE);
    expect(geometry.getAttribute('position').itemSize).toBe(3);
    expect(geometry.getAttribute('normal')).toBeUndefined();
  });

  it('assigns one shared seed to every vertex of a square', () => {
    let calls = 0;
    const geometry = createFlameParticlesGeometry(4, () => {
      calls += 1;
      return calls / 10;
    });
    const seed = geometry.getAttribute('aSeed');

    expect(calls).toBe(4);
    expect(seed.getX(0)).toBeCloseTo(0.1);
    expect(seed.getX(VERTICES_PER_PARTICLE - 1)).toBeCloseTo(0.1);
    expect(seed.getX(VERTICES_PER_PARTICLE)).toBeCloseTo(0.2);
  });

  it('clamps a non-positive particle count to a single square', () => {
    const geometry = createFlameParticlesGeometry(0, CONSTANT_RANDOM);

    expect(geometry.getAttribute('position').count).toBe(VERTICES_PER_PARTICLE);
  });

  it('sets a generous bounding volume so risen squares are not culled', () => {
    const geometry = createFlameParticlesGeometry(8, CONSTANT_RANDOM);

    expect(geometry.boundingSphere?.radius).toBe(FLAME_BOUNDING_RADIUS);
    expect(geometry.boundingBox?.max.y).toBe(FLAME_BOUNDING_RADIUS);
  });
});

describe('createFlameMaterial', () => {
  it('is an additive, emissive, non-writing transparent material', () => {
    const material = createFlameMaterial('#ffaa33');

    expect(material.transparent).toBe(true);
    expect(material.depthWrite).toBe(false);
    expect(material.blending).toBe(THREE.AdditiveBlending);
    expect(material.toneMapped).toBe(false);
  });

  it('exposes time, color and scale uniforms', () => {
    const material = createFlameMaterial('#ffaa33');

    expect(material.uniforms.uTime.value).toBe(0);
    expect(material.uniforms.uScale.value).toBe(1);
    expect(material.uniforms.uColor.value).toBeInstanceOf(THREE.Color);
    expect(material.uniforms.uColor.value.getHexString()).toBe('ffaa33');
  });

  it('drives animation purely from the uTime uniform', () => {
    const material = createFlameMaterial('#ffaa33');

    updateFlameMaterialTime(material, 12.5);

    expect(material.uniforms.uTime.value).toBe(12.5);
  });

  it('is an instancing-aware camera-facing square shader', () => {
    const material = createFlameMaterial('#ffaa33');

    expect(material.vertexShader).toContain('USE_INSTANCING');
    expect(material.vertexShader).toContain('instanceMatrix');
    expect(material.vertexShader).toContain('camRight');
    expect(material.vertexShader).not.toContain('rotationMatrix');
  });
});

describe('Flame', () => {
  it('is a THREE.Mesh that can be added straight to a scene', () => {
    const flame = new Flame();

    expect(flame).toBeInstanceOf(THREE.Mesh);
  });

  it('reuses one shared geometry and material across default instances', () => {
    const a = new Flame();
    const b = new Flame();

    expect(a.geometry).toBe(b.geometry);
    expect(a.material).toBe(b.material);
  });

  it('creates a private material when given a custom color', () => {
    const shared = new Flame();
    const custom = new Flame({ color: '#00ff00' });

    expect(custom.material).not.toBe(shared.material);
    expect(custom.material.uniforms.uColor.value.getHexString()).toBe('00ff00');
  });

  it('applies scale through the object transform', () => {
    const flame = new Flame({ color: '#ffaa33', scale: 3 });

    expect(flame.scale.x).toBe(3);
  });

  it('advances its own uTime on render', () => {
    const flame = new Flame({ color: '#ffaa33' });

    flame.onBeforeRender();

    expect(flame.material.uniforms.uTime.value).toBeGreaterThan(0);
  });

  it('defaults to a full square count', () => {
    const flame = new Flame({ color: '#ffaa33' });

    expect(flame.geometry.getAttribute('position').count).toBe(
      DEFAULT_FLAME_PARTICLE_COUNT * VERTICES_PER_PARTICLE
    );
  });
});

describe('createFlameInstancedMesh', () => {
  it('returns an InstancedMesh with the requested instance count', () => {
    const mesh = createFlameInstancedMesh(500);

    expect(mesh).toBeInstanceOf(THREE.InstancedMesh);
    expect(mesh.count).toBe(500);
  });

  it('disables frustum culling since squares animate outside local bounds', () => {
    const mesh = createFlameInstancedMesh(10);

    expect(mesh.frustumCulled).toBe(false);
  });

  it('shares one geometry and material across all instances', () => {
    const mesh = createFlameInstancedMesh(64, { particleCount: 40 });

    expect(mesh.geometry.getAttribute('position').count).toBe(40 * VERTICES_PER_PARTICLE);
    expect(mesh.material.uniforms.uColor.value.getHexString()).toBe('ffaa33');
  });
});
