import { assert } from '@tgdf';
import { NavMeshManager } from '@tgdf/internal-3d/NavMeshManager';

import { GameScene } from './GameScene';
import { Monk } from '../gameObjects/players/Monk/Monk';
import { MAIN_CROWD_ID, NAVMESH_AGENT_RADIUS, SPAWNER_IDS } from '../../constants';

export class DungeonLevelScene extends GameScene {
  protected override onInit(navMeshManager: NavMeshManager): void {
    navMeshManager.addCrowd(MAIN_CROWD_ID, {
      maxAgents: 100,
      maxAgentRadius: NAVMESH_AGENT_RADIUS,
    });

    const navMesh = navMeshManager.navMesh;
    assert(navMesh, 'NavMesh is not initialized');

    const spawner = this.getObjectByName(SPAWNER_IDS.PLAYER);

    if (spawner) {
      const { x, z } = spawner.position;
      const monk = new Monk(this);
      monk.position.set(x, 1, z);
      this.add(monk);
      this.camera.follow(monk);
    }
  }
}
