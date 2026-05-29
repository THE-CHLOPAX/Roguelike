import { Scene } from '@tgdf';
import * as THREE from 'three';

import { OrtographicCamera } from '../cameras/OrtographicCamera';
import { RigidFloorObject } from '../gameObjects/RigidFloorObject';

const GAME_GRAVITY = new THREE.Vector3(0, -9.81, 0);

export class GameScene extends Scene {
  public camera: OrtographicCamera;

  constructor(floorObject: THREE.Object3D) {
    super();

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

    this._initialize(floorObject);
  }

  private async _initialize(floorObject: THREE.Object3D): Promise<void> {
    await this.initializePhysicsWorld(GAME_GRAVITY);

    const rigidFloorObject = new RigidFloorObject(this, floorObject);
    this.add(rigidFloorObject);

    await this.initializeNavMeshManager(rigidFloorObject);

    this.onInit();
  }

  protected onInit(): void {}
}
