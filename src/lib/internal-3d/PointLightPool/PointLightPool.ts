import * as THREE from 'three';

const DEFAULT_POOL_SIZE = 8;

/**
 * Fixed-size pool of PointLights that stay in the scene graph for the scene's
 * whole lifetime. Three.js bakes the light count into every lit material's
 * shader program, so adding or removing a light mid-game synchronously
 * recompiles all of them (a multi-frame freeze). Borrowing a parked light
 * keeps the count constant: the only compile happens once, on scene entry.
 *
 */
export class PointLightPool {
  public readonly root = new THREE.Group();

  private _available: THREE.PointLight[] = [];

  constructor(size: number = DEFAULT_POOL_SIZE) {
    this.root.name = 'PointLightPool';

    for (let i = 0; i < size; i++) {
      const light = new THREE.PointLight(0xffffff, 0);
      this.root.add(light);
      this._available.push(light);
    }
  }

  /**
   * Borrow a light and attach it to `parent`, which must be inside the same
   * scene graph as the pool root. Configure color/intensity/distance/decay on
   * the returned light. Returns null when the pool is exhausted — treat the
   * light as optional. Release in the borrower's onDestroyed, which runs
   * before the borrower detaches from the scene, so the light never leaves
   * the graph.
   */
  public acquire(parent: THREE.Object3D): THREE.PointLight | null {
    const light = this._available.pop();
    if (!light) return null;

    light.position.set(0, 0, 0);
    parent.add(light);
    return light;
  }

  /** Park a borrowed light back in the pool. Safe to call with null or twice. */
  public release(light: THREE.PointLight | null): void {
    if (!light || this._available.includes(light)) return;

    light.intensity = 0;
    light.position.set(0, 0, 0);
    this.root.add(light);
    this._available.push(light);
  }
}
