import { traverseFind, isMesh } from '@tgdf';

import { TEST_FLOOR_PLANE_MESH_NAME } from '../../constants';
import { Monk } from '../../3D/classes/gameObjects/players/Monk';
import { TestScene, TestSceneConstructorOptions } from './TestScene';
import { generateNavMeshFromThreeDObject } from '../../3D/utils/generateNavMeshFromThreeDObject';

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
}
