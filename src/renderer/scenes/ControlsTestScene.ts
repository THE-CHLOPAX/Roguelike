import * as THREE from 'three';
import { Scene, SceneConstructorOptions, useAssetStore } from '@tgdf';

import { CHECKERBOARD_TEXTURE } from '../constants';
import { pixelateTexture } from '../3D/utils/pixelateTexture';
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
    const frustumSize = 1;

    this.camera = new InertialOrtographicCameraWithControls({
      options: {
        left: (-frustumSize * aspectRatio) / 2,
        right: (frustumSize * aspectRatio) / 2,
        top: frustumSize / 2,
        bottom: -frustumSize / 2,
        near: 0.1,
        far: 20,
      },
      zoom: {
        min: 0.18,
        max: 0.35,
      },
      scene: this,
    });
    this.camera.position.set(3, 3, 3);
    this.camera.lookAt(0, 0, 0);

    this.background = new THREE.Color(0x151729);

    const floorPlaneGeometry = new THREE.PlaneGeometry(10, 10);
    const floorPlaneMaterial = new THREE.MeshPhongMaterial({
      map: checkerboardTexture,
    });
    const floorPlane = new THREE.Mesh(floorPlaneGeometry, floorPlaneMaterial);
    floorPlane.position.set(0, 0, 0);
    floorPlane.rotation.x = -Math.PI / 2;
    floorPlane.receiveShadow = true;
    this.add(floorPlane);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(100, 100, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(2048, 2048);
    this.add(directionalLight);
  }
}
