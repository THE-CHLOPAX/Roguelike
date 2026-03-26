import { Monk } from '../../3D/classes/gameObjects/players/Monk';
import { TestScene, TestSceneConstructorOptions } from './TestScene';
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
  }
}
