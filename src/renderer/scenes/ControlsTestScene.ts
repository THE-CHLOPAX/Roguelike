import * as THREE from 'three';
import {
  GamepadInstance,
  Scene,
  SceneConstructorOptions,
  useAssetStore,
  useGamepadStore,
} from '@tgdf';

import { CHECKERBOARD_TEXTURE } from '../constants';
import { pixelateTexture } from '../3D/utils/pixelateTexture';
import { RigidPlane } from '../3D/classes/gameObjects/RigidPlane';
import { ControlledBox } from '../3D/classes/gameObjects/ControlledBox';
import { ControlledGamepadBox } from '../3D/classes/gameObjects/ControlledGamepadBox';
import { OrtographicCameraWithControls } from '../3D/classes/cameras/OrtographicCameraWithControls';

export class ControlsTestScene extends Scene {
  private _gamepadStoreEvents = useGamepadStore.getState().gamepadEvents;

  public camera: OrtographicCameraWithControls;

  constructor(options: SceneConstructorOptions) {
    super(options);

    const checkerboardTexture = pixelateTexture(
      useAssetStore.getState().textureCache.get(CHECKERBOARD_TEXTURE)
    );
    checkerboardTexture?.repeat.set(3, 3);

    const aspectRatio = window.innerWidth / window.innerHeight;
    const frustumSize = 9;

    this.camera = new OrtographicCameraWithControls({
      options: {
        left: (-frustumSize * aspectRatio) / 2,
        right: (frustumSize * aspectRatio) / 2,
        top: frustumSize / 2,
        bottom: -frustumSize / 2,
        near: 0.1,
        far: 40,
      },
      scene: this,
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

    // Add test cube rigid body
    /* const controlledBox = new ControlledBox(this);
    controlledBox.position.set(0, 1, 0);
    this.add(controlledBox); */

    this._gamepadStoreEvents.on('gamepadconnected', this._onGamepadConnected);
  }

  private _onGamepadConnected = ({ gamepad }: { gamepad: GamepadInstance }) => {
    const controlledGamepadBox = new ControlledGamepadBox(this, gamepad);
    controlledGamepadBox.position.set(0, 1, 0);
    this.add(controlledGamepadBox);
  };

  protected onDestroy(): void {
    this._gamepadStoreEvents.off('gamepadconnected', this._onGamepadConnected);
  }
}
