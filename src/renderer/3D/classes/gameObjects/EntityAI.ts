import { Scene } from '@tgdf';
import { NavMesh } from '@recast-navigation/core';

import { Entity } from './Entity';
import { AIRoamingOptions } from '../../types';
import { MAIN_CROWD_ID } from '../../constants';
import { NavMeshAgent } from '../gameObjectComponents/NavMeshAgent';
import { EntityMovable, EntityMovableOptions } from './EntityMovable';
import { getEntitiesWithinRadius } from '../../utils/getEntitiesWithinRadius';

export type EntityAIOptions = EntityMovableOptions & {
  detectionRadius: number;
  roaming: AIRoamingOptions;
  enemyTypes: (typeof Entity)[];
};

export class EntityAI extends EntityMovable {
  public navMeshAgent: NavMeshAgent;
  public navMesh: NavMesh;

  public enemiesInRange: Entity[] = [];

  private _roaming: AIRoamingOptions | null = null;

  constructor(
    scene: Scene,
    public options: EntityAIOptions
  ) {
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

    this._roaming = options.roaming;

    this.onInit();
  }

  public get roaming(): AIRoamingOptions | null {
    return this._roaming;
  }

  protected override onUpdate(deltaTime: number): void {
    super.onUpdate(deltaTime);

    const entitiesInRange = getEntitiesWithinRadius(this, this.options.detectionRadius);

    // Update list of enemies in range
    this.enemiesInRange = entitiesInRange.filter((entity) => {
      return this.options.enemyTypes.some((enemyType) => {
        return entity instanceof enemyType;
      });
    });
  }

  protected onInit(): void {}
}
