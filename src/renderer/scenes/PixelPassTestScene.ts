import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { logger, Scene, SceneConstructorOptions, useAssetStore } from '@tgdf';

import { CHECKERBOARD_TEXTURE, TEST_TEAPOT_ASSET_ID } from '../constants';

export class PixelPassTestScene extends Scene {
  public camera: THREE.Camera;

  private _teapot: THREE.Object3D | undefined;
  private _controls: OrbitControls | undefined;

  constructor(options: SceneConstructorOptions) {
    super(options);
    this.name = 'Test Scene';

    const aspectRatio = window.innerWidth / window.innerHeight;
    const checkerboardTexture = pixelateTexture(
      useAssetStore.getState().textureCache.get(CHECKERBOARD_TEXTURE)
    );
    checkerboardTexture?.repeat.set(3, 3);

    this.camera = new THREE.OrthographicCamera(-aspectRatio, aspectRatio, 1, -1, 0.1, 20);

    this.background = new THREE.Color(0x151729);

    this._teapot = useAssetStore.getState().modelCacheJSON.get(TEST_TEAPOT_ASSET_ID)?.clone();

    if (this._teapot) {
      this._teapot.scale.set(0.1, 0.1, 0.1);
      this._teapot.castShadow = true;
      this.add(this._teapot);
    } else {
      logger({ message: 'TestScene: Teapot asset not found in asset store.', type: 'error' });
    }

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

    const spotLight = new THREE.SpotLight(0xff8800, 1, 10, Math.PI / 4, 0.02, 2);
    spotLight.position.set(2, 2, 0);
    const target = spotLight.target;
    this.add(target);
    target.position.set(0, 0, 0);
    spotLight.castShadow = true;
    this.add(spotLight);

    this.events.on('rendererChange', ({ renderer }) => {
      if (!renderer) return;
      this._controls?.dispose();
      this._controls = new OrbitControls(this.camera, renderer.domElement);
      this._controls.target.set(0, 0, 0);
      this.camera.position.z = 7;
      this.camera.position.y = 7 * Math.tan(Math.PI / 6);
      this._controls.update();
    });
  }

  protected override onUpdate(deltaTime: number): void {
    // Rotate the teapot if it exists
    if (this._teapot) {
      this._teapot.rotation.z += deltaTime * 0.5; // Rotate at 0.5 radians per second
    }
  }
}

function pixelateTexture(texture?: THREE.Texture): THREE.Texture | undefined {
  if (!texture) return undefined;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
