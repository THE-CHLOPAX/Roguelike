import * as THREE from 'three';
import { v4 as uuid } from 'uuid';
import { traverseFind, isMesh, logger, GameObject, RigidBody } from '@tgdf';

import { TEST_FLOOR_PLANE_MESH_NAME } from '../../constants';
import { Monk } from '../../3D/classes/gameObjects/players/Monk';
import { TestScene, TestSceneConstructorOptions } from './TestScene';
import { Skeleton } from '../../3D/classes/gameObjects/mobs/Skeleton';
import { NavMeshAgent } from '../../3D/classes/gameObjectComponents/NavMeshAgent';
import { MouseInteractionObserver } from '../../3D/classes/gameObjectComponents/MouseInteractionObserver';

const OBSTACLE_BOX_SIZE = 1;

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
    skeleton.position.set(0, 1, 0);
    this.add(skeleton);

    skeleton.toggleDebug(true);

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

    this._bindMouseInteractionObserver();
  }

  protected override onUpdate(deltaTime: number): void {
    super.onUpdate(deltaTime);
  }

  private _bindMouseInteractionObserver() {
    const floorPlaneMesh = traverseFind(this, (child) => child.name === TEST_FLOOR_PLANE_MESH_NAME);

    if (!floorPlaneMesh || !isMesh(floorPlaneMesh)) {
      logger({
        message: `Could not find floor plane mesh with name
        ${TEST_FLOOR_PLANE_MESH_NAME} for mouse interaction observer.`,
        type: 'error',
      });
      return;
    }

    const planeMouseInteractionObserver = this.floorPlane.addComponent(
      'MIO',
      new MouseInteractionObserver(this.floorPlane, [floorPlaneMesh])
    );

    planeMouseInteractionObserver.onRightClick((intersection) => {
      const obstaclePosition = intersection[0].point.clone();
      obstaclePosition.y += OBSTACLE_BOX_SIZE / 2; // Raise the box so it sits on the plane
      this._createObstacleBox(obstaclePosition);
    });
  }

  private _createObstacleBox(position: THREE.Vector3) {
    const obstacleBox = new GameObject({ scene: this });
    const geometry = new THREE.BoxGeometry(OBSTACLE_BOX_SIZE, OBSTACLE_BOX_SIZE, OBSTACLE_BOX_SIZE);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    obstacleBox.add(mesh);
    obstacleBox.position.copy(position);

    obstacleBox.addComponent('RigidBody', new RigidBody(obstacleBox, { type: 'static' }));

    if (!this.navMeshManager) {
      logger({
        message: 'NavMeshManager not initialized. Cannot add obstacle.',
        type: 'error',
      });
      return;
    }

    this.navMeshManager.addBoxObstacle(uuid(), obstacleBox);
  }
}
