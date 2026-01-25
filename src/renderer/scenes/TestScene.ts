import * as THREE from 'three';
import { logger, Scene, SceneConstructorOptions, useAssetStore } from '@tgdf';

import { Camera } from '../3D/Camera';
import { TEST_TEAPOT_ASSET_ID } from '../constants';

export class TestScene extends Scene {
  public camera: THREE.Camera;

  private _teapot: THREE.Object3D | undefined;

  constructor(options: SceneConstructorOptions) {
    super(options);
    this.name = 'Test Scene';

    console.log('TestScene keyboardInput:', this.keyboardInput);
    console.log('TestScene mouseInput:', this.mouseInput);

    this.camera = new Camera({
      options: { fov: 75, aspect: window.innerWidth / window.innerHeight, near: 0.1, far: 1000 },
      scene: this,
    });
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
