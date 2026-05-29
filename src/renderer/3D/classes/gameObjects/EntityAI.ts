import { Scene } from '@tgdf';
import { NavMesh } from '@recast-navigation/core';

import { MAIN_CROWD_ID } from '../../constants';
import { NavMeshAgent } from '../gameObjectComponents/NavMeshAgent';
import { EntityMovable, EntityMovableOptions } from './EntityMovable';

export type EntityAIOptions = EntityMovableOptions;

export class EntityAI extends EntityMovable {
  public navMeshAgent: NavMeshAgent;
  public navMesh: NavMesh;

  constructor(scene: Scene, options: EntityMovableOptions) {
    super(scene, options);

    if (!scene.navMeshManager) {
      throw new Error('Scene NavMeshManager is not initialized');
    }

    if (!scene.navMeshManager.navMesh) {
      throw new Error('NavMesh is not available in NavMeshManager');
    }

    this.navMesh = scene.navMeshManager.navMesh;

    const mainCrowd = scene.navMeshManager.getCrowd(MAIN_CROWD_ID);
    if (!mainCrowd) {
      throw new Error(`Main enemy crowd with ID ${MAIN_CROWD_ID} not found in NavMeshManager`);
    }

    this.navMeshAgent = this.addComponent('NavMeshAgent', new NavMeshAgent(this, mainCrowd));

    this.onInit();
  }

  protected onInit(): void {}
}
