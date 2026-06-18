import * as THREE from 'three';
import { useAssetStore } from '@tgdf';
import { NavMeshManager } from '@tgdf/internal-3d/NavMeshManager';

import { GameScene } from './GameScene';
import { FMODAudio } from '../../../FMOD/FMODAudio';
import { FMOD_EVENTS } from '../../../FMOD/constants';
import { CHECKERBOARD_TEXTURE } from '../../constants';
import { Monk } from '../gameObjects/players/Monk/Monk';
import { pixelateTexture } from '../../utils/pixelateTexture';
import { Skeleton } from '../gameObjects/mobs/Skeleton/Skeleton';
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
    navMeshManager.addCrowd(MAIN_CROWD_ID, {
      maxAgents: 100,
      maxAgentRadius: NAVMESH_AGENT_RADIUS,
    });

    const monk = new Monk(this);
    this.add(monk);

    this.camera.follow(monk);

    const skeleton = new Skeleton(this);
    this.add(skeleton);

    FMODAudio.getInstance().playEvent(FMOD_EVENTS.MUSIC_SYSTEM);
  }
}
