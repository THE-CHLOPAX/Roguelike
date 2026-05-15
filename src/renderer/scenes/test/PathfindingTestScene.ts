import { Monk } from '../../3D/classes/gameObjects/players/Monk';
import { TestScene, TestSceneConstructorOptions } from './TestScene';
import { Skeleton } from '../../3D/classes/gameObjects/mobs/Skeleton';
import { NavMeshAgent } from '../../3D/classes/gameObjectComponents/NavMeshAgent';

// NavMesh configuration
const AGENT_RADIUS = 0.6; // Agent radius in world units
const AGENT_HEIGHT = 2.0;

export class PathfindingTestScene extends TestScene {
  private _monk: Monk | null = null;

  constructor(options: TestSceneConstructorOptions) {
    super({
      ...options,
      width: 30,
      height: 30,
      checkerboardRepeat: 3,
    });

    const monk = new Monk(this);
    this._monk = monk;

    this.add(monk);

    const skeleton = new Skeleton(this);
    this.add(skeleton);

    this.initializeNavMeshManager(this.floorPlane, {
      agentHeight: AGENT_HEIGHT,
      agentRadius: AGENT_RADIUS,
    }).then(() => {
      const crowd = this.navMeshManager!.addCrowd('main-crowd', {
        maxAgents: 100,
        maxAgentRadius: AGENT_RADIUS,
      });

      if (crowd) {
        skeleton.addComponent(
          'NavMeshAgent',
          new NavMeshAgent(skeleton, crowd, {
            radius: AGENT_RADIUS,
            height: AGENT_HEIGHT,
          })
        );
      }
    });
  }

  protected override onUpdate(deltaTime: number): void {
    super.onUpdate(deltaTime);
  }
}
