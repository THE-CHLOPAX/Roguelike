import * as THREE from 'three';
import { Scene, SceneConstructorOptions, useAssetStore } from '@tgdf';

import { pixelateTexture } from '../../3D/utils/pixelateTexture';
import { RigidPlane } from '../../3D/classes/gameObjects/RigidPlane';
import { OrtographicCamera } from '../../3D/classes/cameras/OrtographicCamera';
import { CHECKERBOARD_TEXTURE, TEST_FLOOR_PLANE_MESH_NAME } from '../../constants';

export type TestSceneConstructorOptions = SceneConstructorOptions & {
  width?: number;
  height?: number;
  checkerboardRepeat?: number;
};

const DEFAULT_WIDTH = 20;
const DEFAULT_HEIGHT = 20;

const DEFAULT_CHECKERBOARD_REPEAT = 3;

export class TestScene extends Scene {
  public camera: OrtographicCamera;
  public floorPlane: RigidPlane;

  constructor(options?: TestSceneConstructorOptions) {
    super({
      ...options,
      physics: {
        gravity: new THREE.Vector3(0, -9.81, 0),
      },
    });

    const checkerboardTexture = pixelateTexture(
      useAssetStore.getState().textureCache.get(CHECKERBOARD_TEXTURE)
    );

    const planeWidth = options?.width ?? DEFAULT_WIDTH;
    const planeHeight = options?.height ?? DEFAULT_HEIGHT;
    const checkerboardRepeat = options?.checkerboardRepeat ?? DEFAULT_CHECKERBOARD_REPEAT;

    checkerboardTexture?.repeat.set(checkerboardRepeat, checkerboardRepeat);

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
    this.floorPlane = new RigidPlane(
      this,
      new THREE.Vector2(planeWidth, planeHeight),
      floorMaterial,
      TEST_FLOOR_PLANE_MESH_NAME
    );
    this.floorPlane.rotation.x = -Math.PI / 2;
    this.add(this.floorPlane);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(2048, 2048);
    this.add(directionalLight);
  }
}
