import * as THREE from 'three';
import { isMesh, logger, PhysicsManager, Scene } from '@tgdf';
import { NavMeshManager } from '@tgdf/internal-3d/NavMeshManager';

import { ShadersManager } from './ShadersManager/ShadersManager';
import { OrtographicCamera } from '../cameras/OrtographicCamera';
import { RigidFloorObject } from '../gameObjects/RigidFloorObject';

const GAME_GRAVITY = new THREE.Vector3(0, -9.81, 0);

export class GameScene extends Scene {
  public camera: OrtographicCamera;

  private _shadersManager = new ShadersManager();

  constructor(floorObject: THREE.Object3D) {
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

    // Precompile gameplay-effect shader variants during scene entry so their
    // first-use compilation doesn't stall the frame mid-combat. The warmup
    // group must stay in the scene to keep the compiled programs refcounted.
    this.add(this._shadersManager.warmupGroup);
    this.events.on('rendererChange', ({ renderer }) =>
      this._shadersManager.warmup(renderer, this, this.camera)
    );

    this._initialize(floorObject).catch((error) => {
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

  private async _initialize(floorObject: THREE.Object3D): Promise<void> {
    await this.initializePhysicsWorld(GAME_GRAVITY);

    await this.initializeNavMeshManager(floorObject);

    if (!this.navMeshManager || !this.physics) {
      throw new Error('Failed to initialize NavMeshManager or PhysicsManager');
    }

    this._rigidizeCellularFloor(floorObject);

    this.onInit(this.navMeshManager, this.physics);
  }

  private _rigidizeCellularFloor(floorObject: THREE.Object3D): void {
    // Generate rigid floor per cell.
    const floorObjectCells: THREE.Mesh[] = [];
    floorObject.traverse((child) => {
      if (isMesh(child)) floorObjectCells.push(child);
    });

    floorObjectCells.forEach((cell) => {
      const cellRigidFloorObject = new RigidFloorObject(this, cell);
      this.add(cellRigidFloorObject);
    });
  }
}
