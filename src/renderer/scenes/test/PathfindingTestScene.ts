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

// NavMesh configuration
const NAV_CELL_SIZE = 0.2; // Smaller = more precision
const AGENT_RADIUS = 0.6; // Agent radius in world units
const AGENT_HEIGHT = 2.0;

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
      monk.addComponent(
        'NavMeshAgent',
        new NavMeshAgent(monk, this._navMeshCrowd, {
          radius: AGENT_RADIUS,
          height: AGENT_HEIGHT,
        })
      );
    }
  }

  protected override onUpdate(deltaTime: number): void {
    super.onUpdate(deltaTime);

    if (this._navMeshCrowd) {
      this._navMeshCrowd.update(deltaTime);
    }

    if (this._tileCache && this._navMesh) {
      this._tileCache.update(this._navMesh);
    }
  }

  private _generateNavMesh() {
    const floorPlane = traverseFind(this, (child) => child.name === TEST_FLOOR_PLANE_MESH_NAME);

    if (isMesh(floorPlane)) {
      const { navMesh, tileCache } = generateNavMeshFromThreeDObject(floorPlane, {
        cs: NAV_CELL_SIZE,
        ch: NAV_CELL_SIZE,
        // Erode NavMesh by agent radius - this prevents tight gaps
        walkableRadius: Math.ceil(AGENT_RADIUS / NAV_CELL_SIZE),
        walkableHeight: Math.ceil(AGENT_HEIGHT / NAV_CELL_SIZE),
      });

      this._navMesh = navMesh;
      this._tileCache = tileCache;

      if (navMesh) {
        this._navMeshCrowd = new Crowd(navMesh, {
          maxAgents: 10,
          maxAgentRadius: AGENT_RADIUS,
        });
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
      // move monk to clicked point
      if (this._monk) {
        this._monk.moveTo(clickedPoint, this._monk.sprintSpeed);
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
    const obstacleSize = obstacleBoxBounds.getSize(new THREE.Vector3()).multiplyScalar(0.5);

    // Add agent radius as padding to ensure agents can't squeeze through gaps
    const paddedSize = new THREE.Vector3(
      obstacleSize.x + AGENT_RADIUS,
      obstacleSize.y,
      obstacleSize.z + AGENT_RADIUS
    );

    this._tileCache.addBoxObstacle(obstacleBox.position, paddedSize, obstacleBox.rotation.y);

    this.add(obstacleBox);
  }
}
