import { TestScene, TestSceneConstructorOptions } from './TestScene';
import { Monk } from '../../3D/classes/gameObjects/players/Monk/Monk';
import { Skeleton } from '../../3D/classes/gameObjects/mobs/Skeleton/Skeleton';
import { MAIN_ENEMY_CROWD_ID, NAVMESH_AGENT_HEIGHT, NAVMESH_AGENT_RADIUS } from '../../constants';

export class PathfindingTestScene extends TestScene {
  constructor(options: TestSceneConstructorOptions) {
    super({
      ...options,
      width: 30,
      height: 30,
      checkerboardRepeat: 3,
    });

    this.initializeNavMeshManager(this.floorPlane, {
      agentHeight: NAVMESH_AGENT_HEIGHT,
      agentRadius: NAVMESH_AGENT_RADIUS,
    }).then(() => {
      this.navMeshManager!.addCrowd(MAIN_ENEMY_CROWD_ID, {
        maxAgents: 100,
        maxAgentRadius: NAVMESH_AGENT_RADIUS,
      });

      const monk = new Monk(this);
      this.add(monk);

      const skeleton = new Skeleton(this);
      this.add(skeleton);
    });
  }

  protected override onUpdate(deltaTime: number): void {
    super.onUpdate(deltaTime);
  }
}
