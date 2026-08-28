import * as THREE from 'three';
import { PhysicsManager, Scene } from '@tgdf';
import { NavMeshManager } from '@tgdf/internal-3d/NavMeshManager';

import { ShadersManager } from './ShadersManager/ShadersManager';
import { OrtographicCamera } from '../cameras/OrtographicCamera';

const GAME_GRAVITY = new THREE.Vector3(0, -9.81, 0);

export class GameScene extends Scene {
  public camera: OrtographicCamera;

  private _shadersManager = new ShadersManager();

  constructor() {
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
  }

  protected override onUpdate(_deltaTime: number): void {
    if (process.env.NODE_ENV === 'development') {
      this._shadersManager.checkForLateCompiles(this.renderer);
    }
  }

  protected onInit(_navMeshManager: NavMeshManager, _physicsManager: PhysicsManager): void {}

  public async initializePhysics(): Promise<void> {
    await this.initializePhysicsWorld(GAME_GRAVITY);
  }

  public async completeLevelInitialization(floorMesh: THREE.Object3D): Promise<void> {
    await this.initializeNavMeshManager(floorMesh);

    if (!this.navMeshManager || !this.physics) {
      throw new Error('Failed to initialize NavMeshManager or PhysicsManager');
    }

    this.onInit(this.navMeshManager, this.physics);
  }
}
