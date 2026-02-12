import * as THREE from 'three';
import { Scene, SceneConstructorOptions, useAssetStore } from '@tgdf';

import { CHECKERBOARD_TEXTURE } from '../constants';
import { pixelateTexture } from '../3D/utils/pixelateTexture';
import { RigidPlane } from '../3D/classes/gameObjects/RigidPlane';
import { ControlledBox } from '../3D/classes/gameObjects/ControlledBox';
import { InertialOrtographicCameraWithControls } from '../3D/classes/cameras/InertialOrtographicCameraWithControls';

export class ControlsTestScene extends Scene {
  public camera: InertialOrtographicCameraWithControls;

  constructor(options: SceneConstructorOptions) {
    super(options);

    const checkerboardTexture = pixelateTexture(
      useAssetStore.getState().textureCache.get(CHECKERBOARD_TEXTURE)
    );
    checkerboardTexture?.repeat.set(3, 3);

    const aspectRatio = window.innerWidth / window.innerHeight;
    const frustumSize = 9;

    this.camera = new InertialOrtographicCameraWithControls({
      options: {
        left: (-frustumSize * aspectRatio) / 2,
        right: (frustumSize * aspectRatio) / 2,
        top: frustumSize / 2,
        bottom: -frustumSize / 5,
        near: 0.1,
        far: 40,
      },
      scene: this,
    });
    this.camera.position.set(6, 6, 6);
    this.camera.lookAt(0, 0, 0);

    this.background = new THREE.Color(0x151729);

    const floorPlane = new RigidPlane(
      this,
      new THREE.Vector2(20, 20),
      new THREE.MeshPhongMaterial({ map: checkerboardTexture })
    );
    floorPlane.rotation.x = -Math.PI / 2;
    floorPlane.receiveShadow = true;
    this.add(floorPlane);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(100, 100, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(2048, 2048);
    this.add(directionalLight);

    // Add test cube rigid body
    const controlledBox = new ControlledBox(this);
    controlledBox.position.set(0, 1, 0);
    this.add(controlledBox);
  }
}
