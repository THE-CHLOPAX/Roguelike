import * as THREE from 'three';
import { Scene, SceneConstructorOptions, useAssetStore } from '@tgdf';

import { CHECKERBOARD_TEXTURE } from '../../constants';
import { pixelateTexture } from '../../3D/utils/pixelateTexture';
import { RigidPlane } from '../../3D/classes/gameObjects/RigidPlane';
import { OrtographicCamera } from '../../3D/classes/cameras/OrtographicCamera';

export class TestScene extends Scene {
  public camera: OrtographicCamera;

  constructor(options?: SceneConstructorOptions) {
    super(options);

    const checkerboardTexture = pixelateTexture(
      useAssetStore.getState().textureCache.get(CHECKERBOARD_TEXTURE)
    );
    checkerboardTexture?.repeat.set(3, 3);

    const aspectRatio = window.innerWidth / window.innerHeight;
    const frustumSize = 9;

    this.camera = new OrtographicCamera({
      options: {
        left: (-frustumSize * aspectRatio) / 2,
        right: (frustumSize * aspectRatio) / 2,
        top: frustumSize / 2,
        bottom: -frustumSize / 2,
        near: 0.1,
        far: 40,
      },
    });
    this.camera.position.set(6, 6, 6);
    this.camera.lookAt(0, 0, 0);

    this.background = new THREE.Color(0x151729);

    const floorMaterial = new THREE.MeshPhongMaterial({ map: checkerboardTexture });
    const floorPlane = new RigidPlane(this, new THREE.Vector2(20, 20), floorMaterial);
    floorPlane.rotation.x = -Math.PI / 2;
    this.add(floorPlane);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(2048, 2048);
    this.add(directionalLight);
  }
}
