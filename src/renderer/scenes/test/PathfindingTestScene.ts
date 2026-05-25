import { TestScene, TestSceneConstructorOptions } from './TestScene';
import { Monk } from '../../3D/classes/gameObjects/players/Monk/Monk';
import { Skeleton } from '../../3D/classes/gameObjects/mobs/Skeleton';
import { NavMeshAgent } from '../../3D/classes/gameObjectComponents/NavMeshAgent';
import { NAVMESH_AGENT_HEIGHT, NAVMESH_AGENT_RADIUS, MAIN_ENEMY_CROWD_ID } from '../../constants';

export class PathfindingTestScene extends TestScene {
  constructor(options: TestSceneConstructorOptions) {
    super({
      ...options,
      width: 30,
      height: 30,
      checkerboardRepeat: 3,
    });

    const monk = new Monk(this);
    this.add(monk);

    this.camera.follow(monk);

    const skeleton = new Skeleton(this);
    this.add(skeleton);

    this.initializeNavMeshManager(this.floorPlane, {
      agentHeight: NAVMESH_AGENT_HEIGHT,
      agentRadius: NAVMESH_AGENT_RADIUS,
    }).then(() => {
      const crowd = this.navMeshManager!.addCrowd(MAIN_ENEMY_CROWD_ID, {
        maxAgents: 100,
        maxAgentRadius: NAVMESH_AGENT_RADIUS,
      });

      if (crowd) {
        skeleton.addComponent(
          'NavMeshAgent',
          new NavMeshAgent(skeleton, crowd, {
            radius: NAVMESH_AGENT_RADIUS,
            height: NAVMESH_AGENT_HEIGHT,
          })
        );
      }
    });
  }

  protected override onUpdate(deltaTime: number): void {
    super.onUpdate(deltaTime);
  }
}
