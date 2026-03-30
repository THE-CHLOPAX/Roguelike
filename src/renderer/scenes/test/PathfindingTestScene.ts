import * as THREE from 'three';
import { Crowd, NavMesh, TileCache } from '@recast-navigation/core';
import { traverseFind, isMesh, logger, GameObject, RigidBody } from '@tgdf';

import { TEST_FLOOR_PLANE_MESH_NAME } from '../../constants';
import { Monk } from '../../3D/classes/gameObjects/players/Monk';
import { TestScene, TestSceneConstructorOptions } from './TestScene';
import { NavMeshAgent } from '../../3D/classes/gameObjectComponents/NavMeshAgent';
import { generateNavMeshFromThreeDObject } from '../../3D/utils/generateNavMeshFromThreeDObject';
import { MouseInteractionObserver } from '../../3D/classes/gameObjectComponents/MouseInteractionObserver';

const OBSTACLE_BOX_SIZE = 1;

export class PathfindingTestScene extends TestScene {
  private _navMesh: NavMesh | null = null;
  private _tileCache: TileCache | null = null;
  private _navMeshCrowd: Crowd | null = null;
  private _monk: Monk | null = null;

  constructor(options: TestSceneConstructorOptions) {
    super({
      ...options,
      width: 30,
      height: 30,
      checkerboardRepeat: 3,
    });

    this._generateNavMesh();
    this._bindMouseInteractionObserver();

    const monk = new Monk(this);
    this._monk = monk;

    this.add(monk);

    if (this._navMeshCrowd) {
      console.log('Adding nav mesh agent to monk');
      monk.addComponent('NavMeshAgent', new NavMeshAgent(monk, this._navMeshCrowd));
    }
  }

  protected override onUpdate(_deltaTime: number): void {
    super.onUpdate(_deltaTime);

    if (this._navMeshCrowd) {
      this._navMeshCrowd.update(_deltaTime);
    }
  }

  private _generateNavMesh() {
    const floorPlane = traverseFind(this, (child) => child.name === TEST_FLOOR_PLANE_MESH_NAME);

    if (isMesh(floorPlane)) {
      const { navMesh, debugNavMesh, tileCache } = generateNavMeshFromThreeDObject(floorPlane);

      if (debugNavMesh) {
        this.add(debugNavMesh);
      }

      this._navMesh = navMesh;
      this._tileCache = tileCache;

      if (navMesh) {
        this._navMeshCrowd = new Crowd(navMesh, { maxAgents: 10, maxAgentRadius: 1 });
      }
    }
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

    planeMouseInteractionObserver.onLeftClick((intersection) => {
      const clickedPoint = intersection[0].point;

      console.log('Clicked point: ', clickedPoint);

      // move monk to clicked point
      if (this._monk) {
        const navMeshAgent = this._monk.gameObjectComponents.get('NavMeshAgent') as
          | NavMeshAgent
          | undefined;
        if (navMeshAgent) {
          console.log('Requesting move target for nav mesh agent: ', clickedPoint);
          navMeshAgent.requestMoveTarget(clickedPoint);
        }
      }
    });

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

    if (!this._tileCache || !this._navMesh) {
      logger({
        message: 'Tile cache or nav mesh not available, cannot add obstacle to nav mesh.',
        type: 'error',
      });
      return;
    }

    const obstacleBoxBounds = new THREE.Box3().setFromObject(obstacleBox);

    this._tileCache.addBoxObstacle(
      obstacleBox.position,
      obstacleBoxBounds.getSize(new THREE.Vector3()),
      obstacleBox.rotation.y
    );

    this._tileCache.update(this._navMesh);
    this.add(obstacleBox);
  }
}
