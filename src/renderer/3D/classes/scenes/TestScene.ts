import * as THREE from 'three';
import { assert } from '@tgdf';
import { NavMeshManager } from '@tgdf/internal-3d/NavMeshManager';

import { GameScene } from './GameScene';
import { Monk } from '../gameObjects/players/Monk/Monk';
import { MAIN_CROWD_ID, NAVMESH_AGENT_RADIUS } from '../../constants';

export class TestScene extends GameScene {
  constructor() {
    super();

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

    this.camera.follow(monk);
  }
}
