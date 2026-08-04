import * as THREE from 'three';
import { assert, useAssetStore } from '@tgdf';
import { NavMeshManager } from '@tgdf/internal-3d/NavMeshManager';

import { GameScene } from './GameScene';
import { Explosion } from '../gameObjects/Explosion';
import { CHECKERBOARD_TEXTURE } from '../../constants';
import { Monk } from '../gameObjects/players/Monk/Monk';
import { pixelateTexture } from '../../utils/pixelateTexture';
import { MAIN_CROWD_ID, NAVMESH_AGENT_RADIUS } from '../../constants';

export type TestSceneConstructorOptions = {
  width?: number;
  height?: number;
  checkerboardRepeat?: number;
};

const DEFAULT_WIDTH = 30;
const DEFAULT_HEIGHT = 30;

const DEFAULT_CHECKERBOARD_REPEAT = 3;

export class TestScene extends GameScene {
  constructor(options?: TestSceneConstructorOptions) {
    const checkerboardTexture = pixelateTexture(
      useAssetStore.getState().textureCache.get(CHECKERBOARD_TEXTURE)
    );

    // This will get replaced with level loader logic - start
    const planeWidth = options?.width ?? DEFAULT_WIDTH;
    const planeHeight = options?.height ?? DEFAULT_HEIGHT;
    const checkerboardRepeat = options?.checkerboardRepeat ?? DEFAULT_CHECKERBOARD_REPEAT;

    checkerboardTexture?.repeat.set(checkerboardRepeat, checkerboardRepeat);

    const floorMaterial = new THREE.MeshPhongMaterial({ map: checkerboardTexture });

    const floorObject = new THREE.Mesh(
      new THREE.PlaneGeometry(planeWidth, planeHeight),
      floorMaterial
    );
    floorObject.rotation.x = -Math.PI / 2;
    // This will get replaced with level loader logic - end

    super(floorObject);

    this.background = new THREE.Color(0x151729);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(2048, 2048);
    this.add(directionalLight);
  }

  protected override onInit(navMeshManager: NavMeshManager): void {
    const crowd = navMeshManager.addCrowd(MAIN_CROWD_ID, {
      maxAgents: 100,
      maxAgentRadius: NAVMESH_AGENT_RADIUS,
    });

    const navMesh = navMeshManager.navMesh;

    assert(crowd, 'Crowd is not initialized');
    assert(navMesh, 'NavMesh is not initialized');

    const monk = new Monk(this);
    this.add(monk);

    setInterval(() => {
      const explosion = new Explosion(this, {
        position: new THREE.Vector3(-2, 1, -2),
        size: new THREE.Vector2(3, 3),
        colliderRadius: 1.75,
        shakeIntensity: 2,
        knockbackAmount: 0.5,
        damageAmount: 1,
      });
      this.add(explosion);
    }, 2000);

    this.camera.follow(monk);
  }
}
