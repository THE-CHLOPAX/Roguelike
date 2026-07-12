import * as THREE from 'three';
import { Crowd } from '@recast-navigation/core';

import { NAV_MESH_AGENT_MESSAGES } from './constants';
import { logger } from '../../internal-ui/utils/logger';
import { GameObjectComponent } from '../GameObjectComponent';
import { GameObject } from '../../internal-3d/GameObject/GameObject';

export class NavMeshAgent extends GameObjectComponent {
  private _crowd: Crowd;

  constructor(gameObject: GameObject, crowd: Crowd) {
    super(gameObject);
    this._crowd = crowd;
  }

  public calculatePath(target: THREE.Vector3): THREE.Vector3[] | null {
    const { success, path, error } = this._crowd.navMeshQuery.computePath(
      this.gameObject.position,
      target
    );

    if (!success) {
      logger({
        message: NAV_MESH_AGENT_MESSAGES.FAILED_TO_COMPUTE_PATH_TO_TARGET(
          this.gameObject.position,
          target,
          error?.name ?? 'Unknown error'
        ),
        type: 'error',
      });
      return null;
    }

    return path.map((point) => new THREE.Vector3(point.x, point.y, point.z));
  }
}
