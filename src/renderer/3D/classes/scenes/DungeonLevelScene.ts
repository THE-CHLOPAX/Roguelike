import * as THREE from 'three';
import { assert } from '@tgdf';
import { NavMeshManager } from '@tgdf/internal-3d/NavMeshManager';

import { GameScene } from './GameScene';
import { LevelSceneData } from '../../types';
import { Monk } from '../gameObjects/players/Monk/Monk';
import { MAIN_CROWD_ID, NAVMESH_AGENT_RADIUS } from '../../constants';

export class DungeonLevelScene extends GameScene {
  private _objects: THREE.Object3D[];

  constructor(sceneData: LevelSceneData) {
    super(sceneData.floorGroup);
    this._objects = sceneData.objects;
  }

  protected override onInit(navMeshManager: NavMeshManager): void {
    this._objects.forEach((object) => this.add(object));

    navMeshManager.addCrowd(MAIN_CROWD_ID, {
      maxAgents: 100,
      maxAgentRadius: NAVMESH_AGENT_RADIUS,
    });

    const navMesh = navMeshManager.navMesh;
    assert(navMesh, 'NavMesh is not initialized');

    const spawner = this.getObjectByName('player-spawner');

    if (spawner) {
      const { x, z } = spawner.position;
      const monk = new Monk(this);
      monk.position.set(x, 1, z);
      this.add(monk);
      this.camera.follow(monk);
    }
  }
}
