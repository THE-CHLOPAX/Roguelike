import * as THREE from 'three';
import { logger, PhysicsManager, Scene } from '@tgdf';
import { NavMeshManager } from '@tgdf/internal-3d/NavMeshManager';

import { ShadersManager } from './ShadersManager/ShadersManager';
import { OrtographicCamera } from '../cameras/OrtographicCamera';
import { RigidFloorObject, RigidFloorObjectOptions } from '../gameObjects/RigidFloorObject';

const GAME_GRAVITY = new THREE.Vector3(0, -9.81, 0);

export class GameScene extends Scene {
  public camera: OrtographicCamera;

  private _shadersManager = new ShadersManager();

  constructor(floorObject: THREE.Object3D, floorTiles?: RigidFloorObjectOptions[]) {
    super();

    const aspectRatio = window.innerWidth / window.innerHeight;
    const frustumSize = 9;

    this.camera = new OrtographicCamera({
      left: (-frustumSize * aspectRatio) / 2,
      right: (frustumSize * aspectRatio) / 2,
      top: frustumSize / 2,
      bottom: -frustumSize / 2,
      near: 0.1,
      far: 40,
    });

    this.camera.setZoom(1);

    this.add(this._shadersManager.warmupGroup);
    this.events.on('rendererChange', ({ renderer }) =>
      this._shadersManager.warmup(renderer, this, this.camera)
    );

    this._initialize(floorObject, floorTiles).catch((error) => {
      logger({ message: `Failed to initialize GameScene: ${error.message}`, type: 'error' });
      throw new Error('Failed to initialize GameScene');
    });
  }

  protected override onUpdate(_deltaTime: number): void {
    if (process.env.NODE_ENV === 'development') {
      this._shadersManager.checkForLateCompiles(this.renderer);
    }
  }

  protected onInit(_navMeshManager: NavMeshManager, _physicsManager: PhysicsManager): void {}

  private async _initialize(
    floorObject: THREE.Object3D,
    floorTiles?: RigidFloorObjectOptions[]
  ): Promise<void> {
    await this.initializePhysicsWorld(GAME_GRAVITY);

    this.add(floorObject);

    await this.initializeNavMeshManager(floorObject);

    if (!this.navMeshManager || !this.physics) {
      throw new Error('Failed to initialize NavMeshManager or PhysicsManager');
    }

    const tiles = floorTiles ?? [this._getSingleFloorTile(floorObject)];
    tiles.forEach((tile) => {
      const rigidFloorObject = new RigidFloorObject(this, tile);
      this.add(rigidFloorObject);
    });

    this.onInit(this.navMeshManager, this.physics);
  }

  private _getSingleFloorTile(floorObject: THREE.Object3D): RigidFloorObjectOptions {
    const bbox = new THREE.Box3().setFromObject(floorObject);
    const size = bbox.getSize(new THREE.Vector3());

    return {
      position: bbox.getCenter(new THREE.Vector3()),
      size: new THREE.Vector3(size.x, 0.1, size.z),
    };
  }
}
