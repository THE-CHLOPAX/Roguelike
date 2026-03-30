import * as THREE from 'three';
import { traverseFind, isMesh, logger, GameObject, RigidBody } from '@tgdf';

import { TEST_FLOOR_PLANE_MESH_NAME } from '../../constants';
import { Monk } from '../../3D/classes/gameObjects/players/Monk';
import { TestScene, TestSceneConstructorOptions } from './TestScene';
import { generateNavMeshFromThreeDObject } from '../../3D/utils/generateNavMeshFromThreeDObject';
import { MouseInteractionObserver } from '../../3D/classes/gameObjectComponents/MouseInteractionObserver';

const OBSTACLE_BOX_SIZE = 1;

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

    this._generateNavMesh();
    this._bindMouseInteractionObserver();
  }

  private _generateNavMesh() {
    const floorPlane = traverseFind(this, (child) => child.name === TEST_FLOOR_PLANE_MESH_NAME);

    if (isMesh(floorPlane)) {
      const { debugNavMesh } = generateNavMeshFromThreeDObject(floorPlane);

      if (debugNavMesh) {
        this.add(debugNavMesh);
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

    planeMouseInteractionObserver.onLeftClick((intersection) => {});

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

    this.add(obstacleBox);
  }
}
