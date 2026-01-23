import * as THREE from 'three';
import { logger, Scene, useAssetStore } from '@tgdf';

import { TEST_TEAPOT_ASSET_ID } from '../constants';

export class TestScene extends Scene {
  public camera: THREE.Camera;

  private _teapot: THREE.Object3D | undefined;

  constructor() {
    super();
    this.name = 'Test Scene';
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 15;
    this.camera.position.y = 5;

    this._teapot = useAssetStore.getState().modelCacheJSON.get(TEST_TEAPOT_ASSET_ID)?.clone();

    if (this._teapot) {
      this.add(this._teapot);
      this.add(new THREE.DirectionalLight(0xffffff, 0.5));
    } else {
      logger({ message: 'TestScene: Teapot asset not found in asset store.', type: 'error' });
    }
  }

  protected override onUpdate(deltaTime: number): void {
    // Rotate the teapot if it exists
    if (this._teapot) {
      this._teapot.rotation.z += deltaTime * 0.5; // Rotate at 0.5 radians per second
    }
  }
}
